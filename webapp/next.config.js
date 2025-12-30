/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for deployment to any static host
  output: 'export',
  // Disable image optimization (not needed for static export)
  images: {
    unoptimized: true,
  },
  // Copy _redirects file to output directory for Cloudflare Pages
  async afterBuild() {
    const fs = require('fs');
    const path = require('path');
    const redirectsPath = path.join(__dirname, '_redirects');
    const outRedirectsPath = path.join(__dirname, 'out', '_redirects');
    if (fs.existsSync(redirectsPath)) {
      fs.copyFileSync(redirectsPath, outRedirectsPath);
    }
  },
}

module.exports = nextConfig
