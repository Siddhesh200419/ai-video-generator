
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Google avatars
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },

      // AWS S3 images and videos
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },

      // Firebase Storage images
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
    ],
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "radix-ui"],
  },
};

export default nextConfig;
