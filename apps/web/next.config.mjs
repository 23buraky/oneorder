import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // "standalone" output was dropped: its build-trace-collection step is
  // what kept OOM-killing the build on this host's memory-quota'd shared
  // hosting. Running via a custom server + regular `next build` output
  // skips that step entirely — the production directory is assembled with
  // symlinks into the existing node_modules/.next instead of a traced copy.
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
  // Type-checking and linting run as separate CI steps (pnpm type-check /
  // pnpm lint) against the same commit, so re-running them inside next
  // build only duplicates work — and on this host it's what pushes the
  // build past the memory quota, since tsc's checker is the single
  // heaviest step. Safe to skip here since it's already covered elsewhere.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);
