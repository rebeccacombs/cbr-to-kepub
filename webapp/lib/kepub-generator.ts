import JSZip from 'jszip';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

export interface ImageFile {
  name: string;
  data: Uint8Array;
  mimeType: string;
}

function getMediaType(filename: string): string {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  const mediaTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
  };
  return mediaTypes[ext] || 'image/jpeg';
}

function isImageFile(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return IMAGE_EXTENSIONS.includes(ext);
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function createContentOPF(bookTitle: string, imageFiles: ImageFile[]): string {
  const bookId = generateUUID();
  const koboBookId = generateUUID();
  const koboContentId = generateUUID();

  const manifestItems = imageFiles
    .map(
      (img, idx) =>
        `    <item id="img_${img.name}" href="Images/${img.name}" media-type="${img.mimeType}"/>`
    )
    .join('\n');

  const pageItems = imageFiles
    .map(
      (_, idx) =>
        `    <item id="page_${idx + 1}" href="page_${String(idx + 1).padStart(4, '0')}.xhtml" media-type="application/xhtml+xml"/>`
    )
    .join('\n');

  const spineItems = imageFiles
    .map((_, idx) => `    <itemref idref="page_${idx + 1}"/>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${escapeXml(bookTitle)}</dc:title>
    <dc:language>en</dc:language>
    <dc:identifier id="bookid" opf:scheme="UUID">urn:uuid:${bookId}</dc:identifier>
    <meta property="kobo:book-id" content="urn:uuid:${koboBookId}"/>
    <meta property="kobo:content-id" content="urn:uuid:${koboContentId}"/>
  </metadata>
  <manifest>
${manifestItems}
${pageItems}
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  </manifest>
  <spine toc="ncx">
${spineItems}
  </spine>
</package>`;
}

function createTOCNCX(bookTitle: string, numPages: number): string {
  const uid = generateUUID();

  const navPoints = Array.from({ length: numPages }, (_, idx) => {
    const pageNum = idx + 1;
    const pageId = String(pageNum).padStart(4, '0');
    return `    <navPoint id="navpoint-${pageNum}" playOrder="${pageNum}">
      <navLabel>
        <text>Page ${pageNum}</text>
      </navLabel>
      <content src="page_${pageId}.xhtml"/>
    </navPoint>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${uid}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${escapeXml(bookTitle)}</text>
  </docTitle>
  <navMap>
${navPoints}
  </navMap>
</ncx>`;
}

function createXHTMLPage(pageNum: number, imageName: string): string {
  const pageId = String(pageNum).padStart(4, '0');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <title>Page ${pageNum}</title>
    <style type="text/css">
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

export async function createKEPUB(
  bookTitle: string,
  images: ImageFile[]
): Promise<Uint8Array> {
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

  // Add images
  for (const img of images) {
    imagesFolder.file(img.name, img.data, { compression: 'DEFLATE', compressionOptions: { level: 6 } });
  }

  // Add content.opf
  oebps.file('content.opf', createContentOPF(bookTitle, images));

  // Add toc.ncx
  oebps.file('toc.ncx', createTOCNCX(bookTitle, images.length));

  // Add XHTML pages
  images.forEach((img, idx) => {
    const pageNum = idx + 1;
    oebps.file(
      `page_${String(pageNum).padStart(4, '0')}.xhtml`,
      createXHTMLPage(pageNum, img.name)
    );
  });

  // Generate ZIP file
  const blob = await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
    streamFiles: true,
  });

  return blob;
}

export function extractImagesFromFiles(files: { name: string; data: Uint8Array }[]): ImageFile[] {
  // Filter and sort images by filename (natural sort)
  const imageFiles = files
    .filter(file => isImageFile(file.name))
    .sort((a, b) => {
      // Natural sort comparison
      return a.name.localeCompare(b.name, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
      });
    });

  const images: ImageFile[] = [];

  imageFiles.forEach((file, idx) => {
    const baseName = file.name.substring(file.name.lastIndexOf('/') + 1);
    const ext = baseName.substring(baseName.lastIndexOf('.'));
    const pageNum = idx + 1;
    const newName = `page_${String(pageNum).padStart(4, '0')}${ext}`;

    images.push({
      name: newName,
      data: file.data,
      mimeType: getMediaType(baseName),
    });
  });

  return images;
}

