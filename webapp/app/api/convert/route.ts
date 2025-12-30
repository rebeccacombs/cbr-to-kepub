import { NextRequest, NextResponse } from 'next/server';
import { createKEPUB, extractImagesFromFiles } from '@/lib/kepub-generator';
import { put, del } from '@vercel/blob';

// Increase body size limit for large files
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for large files

// Check file type by magic bytes
function detectArchiveType(fileData: Uint8Array): 'zip' | 'rar' | 'unknown' {
  // ZIP files start with PK (0x50 0x4B)
  if (fileData.length >= 2 && fileData[0] === 0x50 && fileData[1] === 0x4B) {
    return 'zip';
  }
  
  // RAR files start with "Rar!" (0x52 0x61 0x72 0x21) or "RAR " (0x52 0x41 0x52 0x20)
  if (fileData.length >= 4) {
    const rar1 = fileData[0] === 0x52 && fileData[1] === 0x61 && fileData[2] === 0x72 && fileData[3] === 0x21;
    const rar2 = fileData[0] === 0x52 && fileData[1] === 0x41 && fileData[2] === 0x52 && fileData[3] === 0x20;
    if (rar1 || rar2) {
      return 'rar';
    }
  }
  
  return 'unknown';
}

async function extractRARFile(fileData: Uint8Array): Promise<{ name: string; data: Uint8Array }[]> {
  // Note: Pure JavaScript RAR extraction is limited
  // Many CBR files are actually ZIP files, so we'll try ZIP first
  // For true RAR files, we recommend using the Python script locally
  throw new Error('RAR extraction requires system unrar. Trying ZIP fallback...');
}

async function extractZIPFile(fileData: Uint8Array): Promise<{ name: string; data: Uint8Array }[]> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(fileData);
  const files: { name: string; data: Uint8Array }[] = [];

  // Sort files by name to maintain page order
  const sortedEntries = Object.entries(zip.files).sort(([a], [b]) => {
    // Natural sort for filenames
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  for (const [filename, file] of sortedEntries) {
    if (!file.dir) {
      const data = await file.async('uint8array');
      files.push({ name: filename, data });
    }
  }

  return files;
}

export async function POST(request: NextRequest) {
  let uploadedBlobUrl: string | null = null;
  let resultBlobUrl: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.cbr')) {
      return NextResponse.json({ error: 'File must be a .cbr file' }, { status: 400 });
    }

    // Read file data
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Optionally: Store original file in Vercel Blob for processing
    // This is useful for very large files or if you want to process asynchronously
    const useBlobStorage = process.env.BLOB_READ_WRITE_TOKEN; // Only if token is set
    
    if (useBlobStorage) {
      try {
        // Upload original file to blob storage temporarily
        const timestamp = Date.now();
        const inputBlob = await put(
          `temp/input-${timestamp}-${file.name}`,
          fileData,
          {
            access: 'public',
            addRandomSuffix: false,
          }
        );
        uploadedBlobUrl = inputBlob.url;
        console.log('Uploaded input file to blob storage:', uploadedBlobUrl);
      } catch (blobError) {
        console.warn('Failed to upload to blob storage, processing in memory:', blobError);
        // Continue with in-memory processing
      }
    }

    // Detect archive type
    const archiveType = detectArchiveType(fileData);
    
    // If it's a true RAR file, provide helpful error message
    if (archiveType === 'rar') {
      // Clean up uploaded blob if we created one
      if (uploadedBlobUrl) {
        try {
          await del(uploadedBlobUrl);
        } catch (e) {
          console.error('Failed to clean up input blob:', e);
        }
      }
      return NextResponse.json(
        { 
          error: 'This file is a true RAR archive. RAR extraction requires system tools that aren\'t available in the browser. Please use the Python script (cbr_to_kepub.py) locally, or convert the RAR to ZIP format first. Many CBR files are actually ZIP files renamed - if you have a ZIP-based CBR, it will work here.' 
        },
        { status: 400 }
      );
    }

    // Try to extract files (ZIP extraction)
    let extractedFiles: { name: string; data: Uint8Array }[];

    try {
      // Try ZIP extraction (most CBR files are actually ZIP)
      extractedFiles = await extractZIPFile(fileData);
    } catch (zipError) {
      // Clean up uploaded blob if we created one
      if (uploadedBlobUrl) {
        try {
          await del(uploadedBlobUrl);
        } catch (e) {
          console.error('Failed to clean up input blob:', e);
        }
      }

      // If ZIP fails and we detected it as ZIP, it might be corrupted
      if (archiveType === 'zip') {
        return NextResponse.json(
          { 
            error: 'Failed to extract ZIP archive. The file may be corrupted or password-protected.' 
          },
          { status: 400 }
        );
      }
      
      // Unknown format
      return NextResponse.json(
        { 
          error: 'Failed to extract archive. Unsupported file format or corrupted file. Please ensure your CBR file is a ZIP-based archive (many CBR files are ZIP files renamed).' 
        },
        { status: 400 }
      );
    }

    if (extractedFiles.length === 0) {
      // Clean up uploaded blob if we created one
      if (uploadedBlobUrl) {
        try {
          await del(uploadedBlobUrl);
        } catch (e) {
          console.error('Failed to clean up input blob:', e);
        }
      }
      return NextResponse.json({ error: 'No files found in archive' }, { status: 400 });
    }

    // Extract and sort images
    const imageFiles = extractImagesFromFiles(extractedFiles);

    if (imageFiles.length === 0) {
      // Clean up uploaded blob if we created one
      if (uploadedBlobUrl) {
        try {
          await del(uploadedBlobUrl);
        } catch (e) {
          console.error('Failed to clean up input blob:', e);
        }
      }
      return NextResponse.json({ error: 'No image files found in archive' }, { status: 400 });
    }

    // Generate book title from filename
    const bookTitle = file.name.replace(/\.cbr$/i, '').replace(/\.rar$/i, '');

    // Create KEPUB
    const kepubData = await createKEPUB(bookTitle, imageFiles);

    // Optionally store result in blob storage and return URL instead of file
    if (useBlobStorage) {
      try {
        const timestamp = Date.now();
        const resultBlob = await put(
          `temp/output-${timestamp}-${bookTitle}.kepub.epub`,
          Buffer.from(kepubData),
          {
            access: 'public',
            addRandomSuffix: false,
            contentType: 'application/epub+zip',
          }
        );
        resultBlobUrl = resultBlob.url;
        console.log('Stored result in blob storage:', resultBlobUrl);

        // Clean up input blob
        if (uploadedBlobUrl) {
          try {
            await del(uploadedBlobUrl);
          } catch (e) {
            console.error('Failed to clean up input blob:', e);
          }
        }

        // Return blob URL instead of file
        // Note: You could also return the file directly, blob storage is optional
        return NextResponse.json(
          {
            success: true,
            downloadUrl: resultBlobUrl,
            filename: `${bookTitle}.kepub.epub`,
            message: 'Conversion complete. File available for download.',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (blobError) {
        console.warn('Failed to store result in blob, returning file directly:', blobError);
        // Fall through to return file directly
      }
    }

    // Return as blob - convert Uint8Array to Buffer for NextResponse
    // Clean up input blob if we created one
    if (uploadedBlobUrl) {
      try {
        await del(uploadedBlobUrl);
      } catch (e) {
        console.error('Failed to clean up input blob:', e);
      }
    }

    return new NextResponse(Buffer.from(kepubData), {
      headers: {
        'Content-Type': 'application/epub+zip',
        'Content-Disposition': `attachment; filename="${bookTitle}.kepub.epub"`,
      },
    });
  } catch (error) {
    console.error('Conversion error:', error);
    
    // Clean up any uploaded blobs on error
    if (uploadedBlobUrl) {
      try {
        await del(uploadedBlobUrl);
      } catch (e) {
        console.error('Failed to clean up input blob on error:', e);
      }
    }
    if (resultBlobUrl) {
      try {
        await del(resultBlobUrl);
      } catch (e) {
        console.error('Failed to clean up result blob on error:', e);
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
