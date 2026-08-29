import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/Hero";
import LongevityCalculator from "@/components/LongevityCalculator";
import Faq from "@/components/Faq";
import WebApplicationSchema from "@/components/WebApplicationSchema";
import { fmtUSD } from "@/lib/coastfire";

export const metadata: Metadata = {
  title: "How Long Will My Money Last? — Retirement Savings Calculator",
  description:
    "Free calculator: see exactly how long your retirement savings will last given your withdrawal amount and expected return, with a chart of your balance over time.",
  alternates: { canonical: "/how-long-will-my-money-last" },
  openGraph: {
    title: "How Long Will My Money Last? — Retirement Savings Calculator",
    description:
      "See exactly how long your retirement savings will last given your withdrawal amount and expected return.",
    url: "/how-long-will-my-money-last",
  },
};

const faqItems = [
  {
    question: "How do I calculate how long my retirement savings will last?",
    answer:
      "Start with your current balance, then subtract your annual withdrawal while adding investment growth each year. If growth outpaces withdrawals, the balance can last indefinitely; if withdrawals outpace growth, it depletes at a calculable age. This calculator runs that projection month by month with your own numbers.",
  },
  {
    question: "What withdrawal rate is 'safe' so my money doesn't run out?",
    answer:
      "The traditional guideline is a 4% initial withdrawal rate (adjusted for inflation each year), based on historical market returns holding up over a 30-year retirement. This calculator uses a fixed nominal withdrawal for simplicity — try lowering your withdrawal amount or raising your expected return to see how the runway changes.",
  },
  {
    question: "Is this the same as a Coast FIRE calculator?",
    answer:
      "No — a Coast FIRE calculator answers \"what do I need invested today to reach my number by retirement, with no more contributions.\" This calculator answers the opposite-direction question: \"once I'm withdrawing from savings, how long does the balance actually last?\" Use our Coast FIRE calculator while you're still accumulating; use this one once you're drawing down.",
  },
  {
    question: "What if my money is projected to run out before I expect it to?",
    answer:
      "Try adjusting the inputs: a lower annual withdrawal, a higher expected return (if your portfolio allocation supports it), or a larger starting balance all extend the runway. Delaying retirement to build a larger balance first is another common lever.",
  },
];

export default function HowLongWillMyMoneyLastPage() {
  return (
    <>
      <Hero
        eyebrow="Retirement Savings Calculator"
        title="How long will"
        emphasis="your money last?"
        suffix=""
        subhead="See exactly how long your retirement savings will last, given your withdrawal amount and expected return — with a chart showing your balance over time."
      />
      <LongevityCalculator />

      <div className="content-section">
        <h2>How this calculator works</h2>
        <p>
          We project your current balance forward month by month: each month it grows by your
          expected return, then your withdrawal comes out. If growth consistently outpaces
          withdrawals, the balance holds steady or keeps growing — otherwise, we find the exact age
          it hits zero.
        </p>
        <h3>Worked example</h3>
        <p>
          At <strong>{fmtUSD(1000000)}</strong> saved, withdrawing <strong>$45,000/year</strong>, with
          a <strong>5% expected annual return</strong> starting at age 60: growth (roughly $50,000/year
          at 5%) slightly outpaces the withdrawal, so the balance holds — a small change in either
          number can flip that balance the other way, which is exactly why it&apos;s worth checking
          your own numbers above rather than relying on a rule of thumb.
        </p>
        <h3>Still building toward retirement?</h3>
        <p>
          If you haven&apos;t retired yet and want to know what you need <em>invested today</em> to
          reach your number, see our <Link href="/">Coast FIRE calculator</Link> or the general{" "}
          <Link href="/fire-calculator">FIRE calculator</Link>.
        </p>
      </div>

      <Faq items={faqItems} />

      <WebApplicationSchema
        name="Retirement Savings Longevity Calculator"
        description="Free calculator for how long retirement savings will last given a withdrawal amount and expected return."
        url="/how-long-will-my-money-last"
      />
    </>
  );
}
