import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} Coast. Estimates only, not financial advice.</span>
      <span style={{ display: "flex", gap: "16px" }}>
        <Link href="/coast-fire-number">Coast number</Link>
        <Link href="/coast-fire-calculator-retirement">Retirement</Link>
        <Link href="/fire-calculator">FIRE calculator</Link>
        <Link href="/how-long-will-my-money-last">Savings longevity</Link>
        <Link href="/barista-fire-calculator">Barista FIRE</Link>
        <Link href="/pricing">Premium</Link>
      </span>
    </footer>
  );
}
