import type { Metadata } from "next";
import Hero from "@/components/Hero";
import CoastCalculator from "@/components/CoastCalculator";
import Faq from "@/components/Faq";
import WebApplicationSchema from "@/components/WebApplicationSchema";
import { createClient } from "@/lib/supabase/server";
import { CoastInputs } from "@/lib/coastfire";

export const metadata: Metadata = {
  title: "Coast Fire Calculator for Retirement — Near-Retirement Edition",
  description:
    "A coast fire retirement calculator for those within a decade or two of retiring: see whether your current savings can coast the rest of the way, or how much longer you'd need to contribute.",
  alternates: { canonical: "/coast-fire-calculator-retirement" },
  openGraph: {
    title: "Coast Fire Calculator for Retirement",
    description:
      "See whether your current savings can coast to retirement without further contributions.",
    url: "/coast-fire-calculator-retirement",
  },
};

const nearRetirementDefaults: CoastInputs = {
  currentAge: 52,
  retireAge: 65,
  currentSavings: 620000,
  monthlyContribution: 2500,
  annualReturn: 6,
  desiredSpending: 75000,
  swr: 4,
};

const faqItems = [
  {
    question: "Does Coast FIRE still make sense close to retirement?",
    answer:
      "Yes — in fact the closer you are to retirement, the smaller the gap between your coast number and your current savings tends to be, since there's less time for compounding to do the work. Many people within 10-15 years of retirement find they're already coasting, or close to it.",
  },
  {
    question: "Should I use a lower expected return this close to retirement?",
    answer:
      "Many people shift toward a more conservative portfolio (more bonds, fewer stocks) as retirement nears, which typically lowers expected returns. This calculator defaults to 6% for the near-retirement scenario versus 7% for the general case — adjust it to match your actual asset allocation.",
  },
  {
    question: "What if I'm not coasting yet and retirement is close?",
    answer:
      "The calculator will show you the age at which continued contributions cross your required coast number, so you can see whether that lands before or after your target retirement age. If it lands after, you'd need to raise contributions, lower your spending target, or push retirement out.",
  },
  {
    question: "How does safe withdrawal rate affect someone retiring soon?",
    answer:
      "The safe withdrawal rate (commonly 4%, sometimes lowered to 3-3.5% for longer or more conservative retirements) directly sets your retirement number: desired spending divided by the rate. A lower withdrawal rate means a larger retirement number and a larger coast number today.",
  },
];

export default async function CoastFireRetirementPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Hero
        eyebrow="Coast Fire Calculator — Retirement Edition"
        title="Coast fire, even"
        emphasis="close to retirement"
        subhead="If retirement is 10-15 years out rather than 30, the math still works the same way — just with less runway. See whether your current savings can already coast the rest of the way."
      />
      <CoastCalculator initialInputs={nearRetirementDefaults} isSignedIn={!!user} />

      <div className="content-section">
        <h2>Coast FIRE with a shorter runway</h2>
        <p>
          The fire coast calculator math doesn&apos;t change based on how close you are to
          retirement — but the result often looks different. With fewer years left for compounding,
          your coast number sits closer to your retirement number, and many people in their 50s and
          60s discover they&apos;ve already crossed it without realizing.
        </p>
        <h3>What to adjust if retirement is near</h3>
        <p>
          Consider a more conservative <strong>expected annual return</strong> if you&apos;ve shifted
          your portfolio toward bonds, and double check your{" "}
          <strong>safe withdrawal rate</strong> — a shorter retirement horizon can sometimes support a
          slightly higher rate than the classic 4% rule, while a longer one may call for lower.
        </p>
      </div>

      <Faq items={faqItems} />

      <WebApplicationSchema
        name="Coast Fire Calculator for Retirement"
        description="Coast FIRE calculator angled for users within a decade or two of retirement."
        url="/coast-fire-calculator-retirement"
      />
    </>
  );
}
