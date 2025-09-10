module.exports = {
  // Target must be serverless
  target: 'serverless',
  // Configure page extensions to include md and mdx
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Add basePath
  basePath: '',
  // Add environment variables
  env: {
    // Add any environment variables here
  },
  // Add webpack configuration
  webpack: (config, { isServer }) => {
    // Add any webpack configuration here
    return config;
  },
  // Add images configuration
  images: {
    domains: [],
  },
  // Add redirects
  async redirects() {
    return [
      // Add any redirects here
    ];
  },
  // Add rewrites
  async rewrites() {
    return [
      // Add any rewrites here
      {
        source: '/:path*',
        destination: '/',
      },
    ];
  },
};
