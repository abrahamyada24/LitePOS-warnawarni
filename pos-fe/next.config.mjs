/** @type {import('next').NextConfig} */
const nextConfig = {
 
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io', // Jika ada image dari sini juga (seperti di data mock restoran)
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'o-cdf.oramiland.com', // Untuk image ayam bakar tadi
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.idntimes.com', // Untuk image kentang goreng
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
