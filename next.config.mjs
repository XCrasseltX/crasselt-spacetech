// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Ermöglicht den statischen HTML-Export
  images: {
    unoptimized: true, // Wichtig, da GitHub Pages keine Bildoptimierung auf dem Server unterstützt
  },
  experimental: {
    typedRoutes: true,
  },
};

basePath: '/crasselt-spacetech',

module.export = nextConfig;
