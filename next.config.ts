import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Mirrors the 301 the live site serves for this legacy URL, which is
      // still linked from several blog posts.
      {
        source: "/ceramic-coating",
        destination: "/car-ceramic-paint-protection",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
