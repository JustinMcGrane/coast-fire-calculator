import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          background: "#0a1c2b",
        }}
      >
        <div style={{ display: "flex", position: "relative", width: 130, height: 130, marginBottom: 12 }}>
          <div
            style={{
              position: "absolute",
              left: 22,
              top: 40,
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#e8a33d",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 90,
              width: 130,
              height: 8,
              background: "#e8a33d",
              opacity: 0.6,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
