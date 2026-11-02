import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Set by the security upgrade flow.
    agentUpgrade: "security",
    // Tree-shake the big icon and LiveKit barrels per import.
    optimizePackageImports: ["@phosphor-icons/react", "@livekit/components-react"],
  },
};

export default nextConfig;
