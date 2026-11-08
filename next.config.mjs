/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        domains:['lh3.googleusercontent.com']
    },
    experimental: {
        optimizePackageImports: ['lucide-react']
    }
};

export default nextConfig;
