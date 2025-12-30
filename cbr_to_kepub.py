#!/usr/bin/env python3
"""
CBR to KEPUB Converter
Converts Comic Book RAR (.cbr) files to Kobo EPUB (.kepub) format
while preserving image quality.
"""

import os
import sys
import zipfile
import shutil
import tempfile
from pathlib import Path
from xml.etree import ElementTree as ET
from xml.dom import minidom

try:
    import rarfile
except ImportError:
    print("Error: rarfile module is required. Install it with: pip install rarfile")
    sys.exit(1)

try:
    from PIL import Image
except ImportError:
    print("Warning: PIL/Pillow not found. Images will be used as-is without validation.")
    Image = None


class CBRToKEPUB:
    def __init__(self, cbr_path, output_path=None):
        self.cbr_path = Path(cbr_path)
        if not self.cbr_path.exists():
            raise FileNotFoundError(f"CBR file not found: {cbr_path}")
        
        if output_path:
            self.output_path = Path(output_path)
        else:
            self.output_path = self.cbr_path.with_suffix('.kepub.epub')
        
        self.temp_dir = None
        self.book_title = self.cbr_path.stem
        
    def extract_cbr(self):
        """Extract images from CBR file (RAR archive)."""
        print(f"Extracting {self.cbr_path.name}...")
        self.temp_dir = Path(tempfile.mkdtemp(prefix='cbr_to_kepub_'))
        
        try:
            with rarfile.RarFile(self.cbr_path) as rf:
                # Extract all files
                rf.extractall(self.temp_dir)
                
                # Get image files, sorted by name
                image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
                images = []
                for file_path in sorted(self.temp_dir.rglob('*')):
                    if file_path.is_file() and file_path.suffix.lower() in image_extensions:
                        images.append(file_path)
                
                if not images:
                    raise ValueError("No image files found in CBR archive")
                
                print(f"Found {len(images)} images")
                return images
                
        except rarfile.RarCannotExec:
            raise RuntimeError(
                "rarfile requires unrar to be installed. "
                "On macOS: brew install unrar\n"
                "On Linux: sudo apt-get install unrar (or equivalent)\n"
                "On Windows: Download from https://www.rarlab.com/rar_add.htm"
            )
    
    def validate_image(self, image_path):
        """Validate and optionally optimize image without quality loss."""
        if Image is None:
            return True
        
        try:
            with Image.open(image_path) as img:
                # Verify image is valid
                img.verify()
            return True
        except Exception as e:
            print(f"Warning: Could not validate image {image_path.name}: {e}")
            return True  # Continue anyway
    
    def create_epub_structure(self, images):
        """Create EPUB structure with images."""
        print("Creating EPUB structure...")
        
        epub_dir = self.temp_dir / 'epub'
        epub_dir.mkdir()
        
        # META-INF directory
        meta_inf = epub_dir / 'META-INF'
        meta_inf.mkdir()
        
        # OEBPS directory for content
        oebps = epub_dir / 'OEBPS'
        oebps.mkdir()
        oebps_images = oebps / 'Images'
        oebps_images.mkdir()
        
        # Copy and rename images
        image_list = []
        for idx, img_path in enumerate(images, 1):
            ext = img_path.suffix.lower()
            new_name = f"page_{idx:04d}{ext}"
            new_path = oebps_images / new_name
            shutil.copy2(img_path, new_path)
            self.validate_image(new_path)
            image_list.append((new_name, new_path))
        
        # Create mimetype file
        mimetype_file = epub_dir / 'mimetype'
        mimetype_file.write_text('application/epub+zip', encoding='utf-8')
        
        # Create container.xml
        container = ET.Element('container', version='1.0', xmlns='urn:oasis:names:tc:opendocument:xmlns:container')
        rootfiles = ET.SubElement(container, 'rootfiles')
        rootfile = ET.SubElement(rootfiles, 'rootfile', {
            'full-path': 'OEBPS/content.opf',
            'media-type': 'application/oebps-package+xml'
        })
        
        container_file = meta_inf / 'container.xml'
        container_file.write_bytes(ET.tostring(container, encoding='utf-8', xml_declaration=True))
        
        # Create content.opf
        self.create_content_opf(oebps, image_list)
        
        # Create toc.ncx
        self.create_toc_ncx(oebps, len(image_list))
        
        # Create XHTML files for each page
        self.create_xhtml_pages(oebps, image_list)
        
        return epub_dir
    
    def create_content_opf(self, oebps_dir, image_list):
        """Create content.opf file with Kobo-specific metadata."""
        package = ET.Element('package', {
            'xmlns': 'http://www.idpf.org/2007/opf',
            'unique-identifier': 'bookid',
            'version': '2.0'
        })
        
        # Metadata
        metadata = ET.SubElement(package, 'metadata', {
            'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
            'xmlns:opf': 'http://www.idpf.org/2007/opf'
        })
        
        ET.SubElement(metadata, 'dc:title').text = self.book_title
        ET.SubElement(metadata, 'dc:language').text = 'en'
        ET.SubElement(metadata, 'dc:identifier', {'id': 'bookid', 'opf:scheme': 'UUID'}).text = f"urn:uuid:{os.urandom(16).hex()}"
        
        # Kobo-specific metadata
        ET.SubElement(metadata, 'meta', {
            'property': 'kobo:book-id',
            'content': f"urn:uuid:{os.urandom(16).hex()}"
        })
        ET.SubElement(metadata, 'meta', {
            'property': 'kobo:content-id',
            'content': f"urn:uuid:{os.urandom(16).hex()}"
        })
        
        # Manifest
        manifest = ET.SubElement(package, 'manifest')
        
        # Add images
        for img_name, _ in image_list:
            ET.SubElement(manifest, 'item', {
                'id': f"img_{img_name}",
                'href': f"Images/{img_name}",
                'media-type': self.get_media_type(img_name)
            })
        
        # Add XHTML pages
        for idx in range(1, len(image_list) + 1):
            ET.SubElement(manifest, 'item', {
                'id': f"page_{idx}",
                'href': f"page_{idx:04d}.xhtml",
                'media-type': 'application/xhtml+xml'
            })
        
        # Add navigation
        ET.SubElement(manifest, 'item', {
            'id': 'ncx',
            'href': 'toc.ncx',
            'media-type': 'application/x-dtbncx+xml'
        })
        
        # Spine
        spine = ET.SubElement(package, 'spine', {'toc': 'ncx'})
        for idx in range(1, len(image_list) + 1):
            ET.SubElement(spine, 'itemref', {'idref': f"page_{idx}"})
        
        # Write OPF file
        opf_file = oebps_dir / 'content.opf'
        opf_file.write_bytes(ET.tostring(package, encoding='utf-8', xml_declaration=True))
    
    def create_toc_ncx(self, oebps_dir, num_pages):
        """Create table of contents (toc.ncx)."""
        ncx = ET.Element('ncx', {
            'xmlns': 'http://www.daisy.org/z3986/2005/ncx/',
            'version': '2005-1'
        })
        
        head = ET.SubElement(ncx, 'head')
        ET.SubElement(head, 'meta', {'name': 'dtb:uid', 'content': f"urn:uuid:{os.urandom(16).hex()}"})
        ET.SubElement(head, 'meta', {'name': 'dtb:depth', 'content': '1'})
        ET.SubElement(head, 'meta', {'name': 'dtb:totalPageCount', 'content': '0'})
        ET.SubElement(head, 'meta', {'name': 'dtb:maxPageNumber', 'content': '0'})
        
        doc_title = ET.SubElement(ncx, 'docTitle')
        ET.SubElement(doc_title, 'text').text = self.book_title
        
        nav_map = ET.SubElement(ncx, 'navMap')
        
        for idx in range(1, num_pages + 1):
            nav_point = ET.SubElement(nav_map, 'navPoint', {
                'id': f"navpoint-{idx}",
                'playOrder': str(idx)
            })
            nav_label = ET.SubElement(nav_point, 'navLabel')
            ET.SubElement(nav_label, 'text').text = f"Page {idx}"
            ET.SubElement(nav_point, 'content', {'src': f"page_{idx:04d}.xhtml"})
        
        ncx_file = oebps_dir / 'toc.ncx'
        ncx_file.write_bytes(ET.tostring(ncx, encoding='utf-8', xml_declaration=True))
    
    def create_xhtml_pages(self, oebps_dir, image_list):
        """Create XHTML pages for each image."""
        for idx, (img_name, _) in enumerate(image_list, 1):
            html = ET.Element('html', {
                'xmlns': 'http://www.w3.org/1999/xhtml',
                'xmlns:epub': 'http://www.idpf.org/2007/ops'
            })
            
            head = ET.SubElement(html, 'head')
            ET.SubElement(head, 'title').text = f"Page {idx}"
            style = ET.SubElement(head, 'style', {'type': 'text/css'})
            style.text = """
                body {
                    margin: 0;
                    padding: 0;
                    text-align: center;
                    background-color: #000;
                }
                img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin: 0 auto;
                }
            """
            
            body = ET.SubElement(html, 'body')
            img = ET.SubElement(body, 'img', {
                'src': f"Images/{img_name}",
                'alt': f"Page {idx}"
            })
            
            xhtml_file = oebps_dir / f"page_{idx:04d}.xhtml"
            xhtml_file.write_bytes(ET.tostring(html, encoding='utf-8', xml_declaration=True))
    
    def get_media_type(self, filename):
        """Get MIME type for image file."""
        ext = Path(filename).suffix.lower()
        media_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.bmp': 'image/bmp',
            '.webp': 'image/webp'
        }
        return media_types.get(ext, 'image/jpeg')
    
    def create_kepub(self, epub_dir):
        """Create KEPUB file from EPUB directory."""
        print(f"Creating KEPUB file: {self.output_path.name}...")
        
        # KEPUB is essentially EPUB with .kepub.epub extension
        # Create ZIP file
        with zipfile.ZipFile(self.output_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
            # Add mimetype first, uncompressed (EPUB spec requirement)
            mimetype_path = epub_dir / 'mimetype'
            zf.write(mimetype_path, 'mimetype', compress_type=zipfile.ZIP_STORED)
            
            # Add all other files
            for file_path in epub_dir.rglob('*'):
                if file_path.is_file() and file_path != mimetype_path:
                    arcname = file_path.relative_to(epub_dir)
                    zf.write(file_path, arcname)
        
        print(f"Successfully created: {self.output_path}")
    
    def convert(self):
        """Main conversion method."""
        try:
            # Extract images from CBR
            images = self.extract_cbr()
            
            # Create EPUB structure
            epub_dir = self.create_epub_structure(images)
            
            # Create KEPUB file
            self.create_kepub(epub_dir)
            
            return self.output_path
            
        finally:
            # Cleanup temporary directory
            if self.temp_dir and self.temp_dir.exists():
                shutil.rmtree(self.temp_dir)
                print("Cleaned up temporary files")


def main():
    if len(sys.argv) < 2:
        print("Usage: python cbr_to_kepub.py <input.cbr> [output.kepub.epub]")
        sys.exit(1)
    
    cbr_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        converter = CBRToKEPUB(cbr_path, output_path)
        converter.convert()
        print("\nConversion completed successfully!")
    except Exception as e:
        print(f"\nError: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()

