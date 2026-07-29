import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["@one-order/database"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  // The production host's shared-hosting account has a hard memory quota
  // (LVE) that kills the build regardless of Node's own heap limits when
  // static generation fans out across multiple workers — capping to 1
  // worker trades build time for staying under that ceiling.
  experimental: {
    cpus: 1,
  },
};

export default withNextIntl(nextConfig);
