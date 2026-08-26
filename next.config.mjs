/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Ganti dengan domain image CDN anda (Cloudflare Images / R2) bila sedia.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "imagedelivery.net" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
