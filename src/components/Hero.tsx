export default function Hero({
  eyebrow,
  title,
  emphasis,
  suffix = ".",
  subhead,
}: {
  eyebrow: string;
  title: string;
  emphasis: string;
  suffix?: string;
  subhead: string;
}) {
  return (
    <div className="hero">
      <div className="hero-eyebrow">{eyebrow}</div>
      <h1>
        {title} <em>{emphasis}</em>
        {suffix}
      </h1>
      <p>{subhead}</p>
      <div className="horizon">
        <svg viewBox="0 0 1000 64" preserveAspectRatio="none">
          <line x1="0" y1="32" x2="1000" y2="32" stroke="#e8a33d" strokeWidth="1" opacity="0.5" />
          <circle cx="500" cy="32" r="5" fill="#e8a33d" />
        </svg>
      </div>
    </div>
  );
}
