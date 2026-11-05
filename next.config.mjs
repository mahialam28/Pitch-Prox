/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  devIndicators: false,
  // Payment methods are a dialog on the Billing page; keep old links working
  async redirects() {
    return [{ source: "/user/settings/billing/payment-method", destination: "/user/settings/billing", permanent: false }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
