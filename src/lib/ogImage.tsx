export function OgCard({
  eyebrow,
  title,
  emphasis,
  domain,
}: {
  eyebrow: string;
  title: string;
  emphasis: string;
  domain: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px 90px",
        background: "#0a1c2b",
        backgroundImage:
          "radial-gradient(circle at 82% 78%, rgba(232,163,61,0.22), transparent 55%)",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 26,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: "#e8a33d",
          marginBottom: 28,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 76,
          lineHeight: 1.15,
          color: "#f2efe7",
          maxWidth: 920,
        }}
      >
        {title}&nbsp;<span style={{ color: "#e8a33d", fontStyle: "italic" }}>{emphasis}</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: 56,
        }}
      >
        <div style={{ display: "flex", width: 220, height: 1, background: "rgba(232,163,61,0.5)" }} />
        <div
          style={{
            display: "flex",
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#e8a33d",
            marginLeft: -7,
          }}
        />
      </div>
      <div style={{ display: "flex", fontSize: 30, color: "#8fa3b0", marginTop: 40 }}>
        {domain}
      </div>
    </div>
  );
}

export const ogSize = { width: 1200, height: 630 };
