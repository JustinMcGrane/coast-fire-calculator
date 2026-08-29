import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "@/lib/ogImage";
import { SITE_URL } from "@/lib/site";

export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Coast FIRE Premium"
        title="Track your"
        emphasis="coast plan"
        domain={SITE_URL.replace(/^https?:\/\//, "")}
      />
    ),
    { ...size }
  );
}
