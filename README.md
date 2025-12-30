# CBR to KEPUB Converter

A simple Python script to convert Comic Book RAR (`.cbr`) files to Kobo EPUB (`.kepub`) format while preserving image quality.

## Features

- ✅ Extracts images from CBR (RAR) archives
- ✅ Creates properly formatted KEPUB files with Kobo-specific metadata
- ✅ Preserves original image quality (no compression or resizing)
- ✅ Automatically generates table of contents and navigation
- ✅ Handles multiple image formats (JPG, PNG, GIF, BMP, WebP)

## Requirements

### Python Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### System Dependencies

The script requires `unrar` to extract RAR files:

- **macOS**: `brew install unrar`
- **Linux (Debian/Ubuntu)**: `sudo apt-get install unrar`
- **Linux (Fedora/RHEL)**: `sudo dnf install unrar`
- **Windows**: Download from [RARLab](https://www.rarlab.com/rar_add.htm) and add to PATH

## Usage

### Basic Usage

Convert a CBR file to KEPUB (output filename will be auto-generated):

```bash
python3 cbr_to_kepub.py "your-file.cbr"
```

The output file will be created in the same directory as the input file with a `.kepub.epub` extension.

### Specify Output File

Convert with a custom output filename:

```bash
python3 cbr_to_kepub.py input.cbr output.kepub.epub
```

## How It Works

1. **Extraction**: Extracts all image files from the CBR (RAR) archive
2. **Validation**: Validates image files (optional, requires Pillow)
3. **EPUB Creation**: Creates a proper EPUB structure with:
   - XHTML pages for each image
   - Table of contents (NCX)
   - Metadata with Kobo-specific tags
   - Proper image organization
4. **KEPUB Packaging**: Packages everything into a `.kepub.epub` file

## Output Format

The script creates a `.kepub.epub` file which is compatible with Kobo e-readers. The file structure follows the EPUB 2.0 standard with Kobo-specific metadata enhancements.

## Notes

- Images are preserved at their original quality - no compression or resizing is performed
- The script automatically sorts images by filename
- Each page is created as a separate XHTML file for proper navigation
- The output file can be directly transferred to a Kobo device

## Troubleshooting

### "rarfile requires unrar to be installed"

Make sure you have `unrar` installed on your system. See the System Dependencies section above.

### "No image files found in CBR archive"

The CBR file may be corrupted or may not contain any recognized image formats. Supported formats: JPG, JPEG, PNG, GIF, BMP, WebP.

### Image validation warnings

If Pillow is not installed, image validation is skipped. The script will still work, but won't verify image integrity.

## License

MIT
