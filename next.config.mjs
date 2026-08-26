/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qbtkwfpeqfczvwikklzo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],

    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;