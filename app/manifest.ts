import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kali — start a call, no fuss",
    short_name: "Kali",
    description: "Friendly video calls. Instant rooms, guest links, live chat.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffa2c0",
    theme_color: "#ffa2c0",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
