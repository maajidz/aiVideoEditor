import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "novocabs.com",
        port: "",
        pathname: "/api/search-image/**", // Or a more general path if needed
      },
    ],
  },
};

export default nextConfig;
