import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/Hero";
import FireCalculator from "@/components/FireCalculator";
import Faq from "@/components/Faq";
import WebApplicationSchema from "@/components/WebApplicationSchema";
import { fmtUSD } from "@/lib/coastfire";

export const metadata: Metadata = {
  title: "FIRE Calculator — Find Your Financial Independence Number",
  description:
    "Free FIRE calculator: find the age you reach financial independence at your current savings rate, and the exact number you need invested to get there.",
  alternates: { canonical: "/fire-calculator" },
  openGraph: {
    title: "FIRE Calculator — Find Your Financial Independence Number",
    description:
      "Find the age you reach financial independence at your current savings rate, and the number you need invested to get there.",
    url: "/fire-calculator",
  },
};

const faqItems = [
  {
    question: "What is a FIRE calculator?",
    answer:
      "A FIRE (Financial Independence, Retire Early) calculator projects your invested savings forward using your current contributions and expected return, to find the age at which your portfolio reaches your FI number — the point where you no longer need employment income to cover your living expenses.",
  },
  {
    question: "How is a FIRE number calculated?",
    answer:
      "Your FI number is your desired annual spending divided by your safe withdrawal rate. For example, $60,000/year at a 4% withdrawal rate gives a $1,500,000 FI number. This calculator then projects your current savings plus ongoing contributions forward to find the age you cross that number.",
  },
  {
    question: "What's the difference between this and a Coast FIRE calculator?",
    answer:
      "A regular FIRE calculator answers \"at my current contribution rate, when do I hit my full number?\" A Coast FIRE calculator answers a different question: \"what would I need invested today, with zero further contributions, to coast to that number by a target age?\" Use this page for the first question; use our Coast FIRE calculator for the second.",
  },
  {
    question: "What withdrawal rate should I use?",
    answer:
      "4% is the traditional \"safe withdrawal rate\" from the Trinity Study, commonly used as a starting point. Some people use 3-3.5% for a longer or more conservative retirement horizon, or up to 4.5-5% for shorter time horizons or more flexible spending.",
  },
  {
    question: "Does this account for Social Security or other income?",
    answer:
      "No — this calculator projects your invested savings only, for simplicity and to give a conservative, self-sufficient number. Any Social Security, pension, or part-time income you expect in retirement would lower the invested amount you actually need.",
  },
];

export default function FireCalculatorPage() {
  return (
    <>
      <Hero
        eyebrow="FIRE Calculator"
        title="Find your"
        emphasis="financial independence"
        suffix=" number."
        subhead="See the age you reach financial independence at your current savings rate, and the exact number you need invested to get there. Free, unlimited, no account required."
      />
      <FireCalculator />

      <div className="content-section">
        <h2>How this FIRE calculator works</h2>
        <p>
          We start with your <strong>FI number</strong>: desired annual spending divided by your
          safe withdrawal rate. Then we project your current invested savings forward, adding your
          monthly contribution and compounding at your expected annual return, to find the exact age
          your balance crosses that number.
        </p>
        <h3>Worked example</h3>
        <p>
          At $65,000 saved, $1,800/month contributed, a 7% expected return, $60,000/year desired
          spending, and a 4% withdrawal rate: your FI number is{" "}
          <strong>{fmtUSD(60000 / 0.04)}</strong>. Projecting forward, that portfolio crosses{" "}
          {fmtUSD(60000 / 0.04)} at roughly age 30 + years of compounding — the calculator above runs
          this instantly with your own numbers.
        </p>
        <h3>Looking for Coast FIRE instead?</h3>
        <p>
          If you want to know what you&apos;d need invested <em>today</em> to stop contributing
          entirely and still reach retirement on schedule, that&apos;s a related but different
          calculation — see our{" "}
          <Link href="/">Coast FIRE calculator</Link>, or the{" "}
          <Link href="/coast-fire-calculator-retirement">near-retirement edition</Link> if you&apos;re
          within a decade or two of retiring. Already retired and drawing down savings instead? See{" "}
          <Link href="/how-long-will-my-money-last">how long your money will last</Link>.
        </p>
      </div>

      <Faq items={faqItems} />

      <WebApplicationSchema
        name="FIRE Calculator"
        description="Free FIRE calculator — find the age you reach financial independence at your current savings rate."
        url="/fire-calculator"
      />
    </>
  );
}
