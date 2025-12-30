import JSZip from 'jszip';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

export interface ImageFile {
  name: string;
  data: Uint8Array;
  mimeType: string;
}

function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
  };
  return mimeTypes[ext] || 'image/jpeg';
}

export function extractImagesFromFiles(files: { name: string; data: Uint8Array }[]): ImageFile[] {
  const images: ImageFile[] = [];
  
  for (const file of files) {
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (IMAGE_EXTENSIONS.includes(ext)) {
      images.push({
        name: file.name,
        data: file.data,
        mimeType: getMimeType(file.name),
      });
    }
  }
  
  // Sort images by filename (natural sort)
  images.sort((a, b) => {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });
  
  return images;
}

export async function createKEPUB(title: string, images: ImageFile[]): Promise<Uint8Array> {
  const zip = new JSZip();
  
  // Add mimetype first (uncompressed, as per EPUB spec)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  
  // Create META-INF directory
  const metaInf = zip.folder('META-INF');
  if (!metaInf) throw new Error('Failed to create META-INF folder');
  
  // Create container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  metaInf.file('container.xml', containerXml);
  
  // Create OEBPS directory
  const oebps = zip.folder('OEBPS');
  if (!oebps) throw new Error('Failed to create OEBPS folder');
  
  const imagesFolder = oebps.folder('Images');
  if (!imagesFolder) throw new Error('Failed to create Images folder');
  
  // Add images and create image list
  const imageList: Array<{ name: string; mimeType: string }> = [];
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const ext = image.name.substring(image.name.lastIndexOf('.'));
    const newName = `page_${String(i + 1).padStart(4, '0')}${ext}`;
    imagesFolder.file(newName, image.data);
    imageList.push({ name: newName, mimeType: image.mimeType });
  }
  
  // Create content.opf
  const contentOpf = createContentOpf(title, imageList);
  oebps.file('content.opf', contentOpf);
  
  // Create toc.ncx
  const tocNcx = createTocNcx(title, imageList.length);
  oebps.file('toc.ncx', tocNcx);
  
  // Create XHTML pages
  for (let i = 0; i < imageList.length; i++) {
    const image = imageList[i];
    const pageNum = i + 1;
    const xhtml = createXhtmlPage(pageNum, image.name, image.mimeType);
    oebps.file(`page_${String(pageNum).padStart(4, '0')}.xhtml`, xhtml);
  }
  
  // Generate ZIP file
  const blob = await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
    mimeType: 'application/epub+zip',
  });
  
  return blob;
}

function createContentOpf(title: string, images: Array<{ name: string; mimeType: string }>): string {
  const now = new Date().toISOString();
  const uuid = 'urn:uuid:' + generateUUID();
  
  let manifest = '';
  let spine = '';
  
  for (let i = 0; i < images.length; i++) {
    const pageNum = i + 1;
    const pageId = `page_${String(pageNum).padStart(4, '0')}`;
    const image = images[i];
    
    manifest += `    <item id="${pageId}" href="page_${String(pageNum).padStart(4, '0')}.xhtml" media-type="application/xhtml+xml"/>\n`;
    manifest += `    <item id="${pageId}_img" href="Images/${image.name}" media-type="${image.mimeType}"/>\n`;
    spine += `    <itemref idref="${pageId}"/>\n`;
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:identifier id="BookId">${uuid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>en</dc:language>
    <dc:creator opf:role="aut">Unknown</dc:creator>
    <dc:date>${now}</dc:date>
    <meta name="cover" content="page_0001_img"/>
    <meta property="dcterms:modified">${now}</meta>
    <meta name="kobo-spine-itemref">page_0001</meta>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
${manifest.trim()}
  </manifest>
  <spine toc="ncx">
${spine.trim()}
  </spine>
  <guide>
    <reference type="cover" title="Cover" href="page_0001.xhtml"/>
  </guide>
</package>`;
}

function createTocNcx(title: string, pageCount: number): string {
  let navPoints = '';
  
  for (let i = 0; i < pageCount; i++) {
    const pageNum = i + 1;
    const pageId = `page_${String(pageNum).padStart(4, '0')}`;
    navPoints += `      <navPoint id="${pageId}" playOrder="${pageNum}">
        <navLabel>
          <text>Page ${pageNum}</text>
        </navLabel>
        <content src="${pageId}.xhtml"/>
      </navPoint>
`;
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${generateUUID()}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${escapeXml(title)}</text>
  </docTitle>
  <navMap>
${navPoints.trim()}
  </navMap>
</ncx>`;
}

function createXhtmlPage(pageNum: number, imageName: string, mimeType: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <title>Page ${pageNum}</title>
    <style type="text/css">
      body { margin: 0; padding: 0; text-align: center; }
      img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
    </style>
  </head>
  <body>
    <img src="Images/${imageName}" alt="Page ${pageNum}"/>
  </body>
</html>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

