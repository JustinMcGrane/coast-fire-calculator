import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "@/lib/ogImage";
import { SITE_URL } from "@/lib/site";

export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Coast Fire Calculator — Retirement Edition"
        title="Coast fire, even"
        emphasis="close to retirement"
        domain={SITE_URL.replace(/^https?:\/\//, "")}
      />
    ),
    { ...size }
  );
}
