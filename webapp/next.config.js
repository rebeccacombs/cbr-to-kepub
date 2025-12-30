/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for deployment to any static host
  output: 'export',
  // Disable image optimization (not needed for static export)
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
