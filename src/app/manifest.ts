import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Coast FIRE Calculator",
    short_name: "Coast",
    description:
      "Free Coast FIRE calculator — find the exact amount you need invested today to coast to retirement.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a1c2b",
    theme_color: "#0a1c2b",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
