/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['gateway.pinata.cloud', 'storage.nadapp.net'],
  },
  async rewrites() {
    return [
      {
        source: '/api/nadfun/:path*',
        destination: 'https://testnet-v3-api.nad.fun/:path*',
      },
    ];
  },
  webpack: (config: any) => {
    config.module.rules.push({
      test: /\.(ttf|woff|woff2|eot)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'static/fonts/',
        },
      },
    });
    return config;
  },
};

export default nextConfig;
