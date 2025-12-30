# CBR to KEPUB Converter

A simple Next.js landing page for downloading the Python script to convert Comic Book RAR (`.cbr`) files to Kobo EPUB (`.kepub`) format.

## Features

- 📥 Download the Python conversion script
- 📖 Clear installation and usage instructions
- 🎨 Beautiful, responsive design with dark mode support
- 🚀 Ready for Vercel deployment (static site, no serverless functions)

## Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd webapp
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Option 1: Deploy via GitHub

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set **Root Directory** to `webapp`
5. Vercel will automatically detect Next.js and deploy

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd webapp
   vercel
   ```

3. Follow the prompts to link your project

## How It Works

This is a static Next.js site that serves:
- A landing page with download instructions
- A download page for the Python script (`/download-script`)
- The Python script itself (`/cbr_to_kepub.py`)

**No server-side processing** - all conversion happens locally using the downloaded Python script.

## Technical Details

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Static site (no serverless functions)

## License

MIT
