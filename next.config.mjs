/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/auth/callback',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' }, // Keep this for extra safety
        ],
      },
    ];
  },
};

export default nextConfig;