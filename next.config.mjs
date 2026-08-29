/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/coast-fire-calc",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
