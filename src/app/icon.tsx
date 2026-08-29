import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        <div style={{ display: "flex", position: "relative", width: 24, height: 24 }}>
          <div
            style={{
              position: "absolute",
              left: 4,
              top: 8,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#e8a33d",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 16,
              width: 24,
              height: 2,
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
