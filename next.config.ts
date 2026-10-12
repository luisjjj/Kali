import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Tree-shake the big icon and LiveKit barrels per import.
    optimizePackageImports: ["@phosphor-icons/react", "@livekit/components-react"],
  },
};

export default nextConfig;
