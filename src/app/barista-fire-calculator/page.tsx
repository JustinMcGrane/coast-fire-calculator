import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/Hero";
import BaristaCalculator from "@/components/BaristaCalculator";
import Faq from "@/components/Faq";
import WebApplicationSchema from "@/components/WebApplicationSchema";
import { fmtUSD } from "@/lib/coastfire";

export const metadata: Metadata = {
  title: "Barista FIRE Calculator — Bridge to Full Retirement",
  description:
    "Free barista FIRE calculator — no signup needed. See if part-time income plus a partial withdrawal from savings still gets you to your full retirement number.",
  alternates: { canonical: "/barista-fire-calculator" },
  openGraph: {
    title: "Barista FIRE Calculator — Bridge to Full Retirement",
    description:
      "Free, no signup needed — see if part-time income plus savings still gets you to full retirement.",
    url: "/barista-fire-calculator",
  },
};

const faqItems = [
  {
    question: "What is Barista FIRE?",
    answer:
      "Barista FIRE is a middle ground between full-time work and full retirement: you've saved enough that a lower-stress, part-time job (the name comes from working somewhere like Starbucks for benefits) can cover most of your living expenses, while a small withdrawal from your investments covers the rest — and your portfolio still grows to your full retirement number by your target age.",
  },
  {
    question: "How is Barista FIRE different from Coast FIRE?",
    answer:
      "Coast FIRE assumes zero withdrawals — your current income (from any job) covers 100% of expenses while your investments grow untouched. Barista FIRE allows a partial withdrawal each year, on top of part-time income, to cover a spending gap — a more flexible bridge if you want to downshift your career before your investments alone can fully support you.",
  },
  {
    question: "How much part-time income do I need for Barista FIRE?",
    answer:
      "That depends on your desired spending and how much you're willing to withdraw from savings each year. Lower your annual withdrawal input here (meaning more of your spending is covered by part-time income) and you'll see your projected balance at retirement improve.",
  },
  {
    question: "What if my savings run out before I reach full retirement age?",
    answer:
      "That means the withdrawal rate is too aggressive for your timeline — try a smaller annual withdrawal (more part-time income), a higher expected return, or a later target retirement age.",
  },
];

export default function BaristaFireCalculatorPage() {
  return (
    <>
      <Hero
        eyebrow="Barista FIRE Calculator"
        title="Bridge to"
        emphasis="full retirement."
        suffix=""
        subhead="See if part-time income plus a partial withdrawal from your savings still gets you to your full retirement number — free, unlimited, no account required."
      />
      <BaristaCalculator />

      <div className="content-section">
        <h2>How this calculator works</h2>
        <p>
          Unlike a pure Coast FIRE calculation (zero withdrawals) or a full retirement drawdown
          (living entirely off savings), Barista FIRE assumes a middle path: part-time income covers
          most of your expenses, and you withdraw only the remaining gap from your portfolio each
          year. We project that balance forward — growing at your expected return, minus your annual
          gap withdrawal — to see whether it still reaches your full retirement number by your target
          age.
        </p>
        <h3>Worked example</h3>
        <p>
          At <strong>$300,000</strong> saved, withdrawing <strong>$15,000/year</strong> to cover the
          gap, with a <strong>7% expected return</strong>, over 25 years to retirement: growth
          consistently outpaces that withdrawal, so the balance keeps climbing toward the{" "}
          <strong>{fmtUSD(60000 / 0.04)}</strong> full-retirement target — the calculator above runs
          this instantly with your own numbers.
        </p>
        <h3>Looking for a different scenario?</h3>
        <p>
          If you want zero withdrawals while coasting, see our{" "}
          <Link href="/">Coast FIRE calculator</Link>. If you&apos;re past full retirement and
          drawing down entirely, see{" "}
          <Link href="/how-long-will-my-money-last">how long your money will last</Link>. For the
          general path to full financial independence, see the <Link href="/fire-calculator">FIRE calculator</Link>.
        </p>
      </div>

      <Faq items={faqItems} />

      <WebApplicationSchema
        name="Barista FIRE Calculator"
        description="Free calculator for Barista FIRE — bridging part-time income and partial savings withdrawal to full retirement."
        url="/barista-fire-calculator"
      />
    </>
  );
}
