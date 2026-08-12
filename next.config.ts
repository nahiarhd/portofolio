import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Native view transitions on route navigations — the DOM half of the
    // graph-led page transition (see scroll pulse in graph/activity.tsx).
    viewTransition: true,
  },
};

export default nextConfig;
