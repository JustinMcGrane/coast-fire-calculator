import type { Metadata } from "next";
import Hero from "@/components/Hero";
import CoastCalculator from "@/components/CoastCalculator";
import Faq from "@/components/Faq";
import WebApplicationSchema from "@/components/WebApplicationSchema";
import { createClient } from "@/lib/supabase/server";
import { fmtUSD } from "@/lib/coastfire";

export const metadata: Metadata = {
  title: "Coast Fire Number Calculator — Calculate Your Coast Fire Number",
  description:
    "Calculate your coast fire number: the exact dollar amount you need invested today to coast, untouched, to your retirement target. Worked example included.",
  alternates: { canonical: "/coast-fire-number" },
  openGraph: {
    title: "Coast Fire Number Calculator",
    description: "Calculate the exact dollar amount you need invested today to coast to retirement.",
    url: "/coast-fire-number",
  },
};

const faqItems = [
  {
    question: "What exactly is a 'coast fire number'?",
    answer:
      "Your coast fire number is the amount you'd need invested today, with zero further contributions, to grow through compounding alone into your full retirement number by your target retirement age. It's smaller than your retirement number because it accounts for years of growth still ahead of you.",
  },
  {
    question: "How do I calculate my coast fire number by hand?",
    answer:
      "Divide your desired annual retirement spending by your safe withdrawal rate to get your retirement number. Then divide that by (1 + expected annual return)^(years until retirement). Example: a $60,000/year spend at a 4% withdrawal rate gives a $1,500,000 retirement number. Discounted 30 years at 7% annual return: $1,500,000 / 1.07^30 ≈ $197,000 — that's the coast fire number.",
  },
  {
    question: "Does a higher expected return lower my coast fire number?",
    answer:
      "Yes. A higher assumed annual return means your money compounds faster, so you need less invested today to reach the same future target — which lowers your coast fire number. It also makes the projection riskier, since real returns vary year to year.",
  },
  {
    question: "What's the difference between coast fire number and retirement number?",
    answer:
      "Your retirement number is the total nest egg you need at retirement to sustain your desired spending. Your coast fire number is what you need today — a smaller figure — for that retirement number to be reachable through growth alone, without any further contributions.",
  },
];

export default async function CoastFireNumberPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const exampleRetirementNumber = 60000 / (4 / 100);
  const exampleCoastNumber = exampleRetirementNumber / Math.pow(1.07, 30);

  return (
    <>
      <Hero
        eyebrow="Coast Fire Number Calculator"
        title="Calculate your"
        emphasis="coast fire number"
        subhead="Your coast fire number is the specific dollar amount you need invested today — untouched — to coast to your retirement target. Plug in your numbers below to calculate it."
      />
      <CoastCalculator isSignedIn={!!user} />

      <div className="content-section">
        <h2>How to calculate your coast fire number</h2>
        <p>
          Your coast fire number comes from two steps. First, find your{" "}
          <strong>retirement number</strong> — desired annual spending divided by your safe
          withdrawal rate. Second, discount that number back to today using your expected annual
          return, compounded over the years remaining until retirement.
        </p>
        <h3>Worked example</h3>
        <p>
          Say you want to spend <strong>$60,000/year</strong> in retirement, using a{" "}
          <strong>4% safe withdrawal rate</strong>, 30 years from now, at a{" "}
          <strong>7% expected annual return</strong>:
        </p>
        <p>
          Retirement number: $60,000 ÷ 0.04 = <strong>{fmtUSD(exampleRetirementNumber)}</strong>
          <br />
          Coast fire number: {fmtUSD(exampleRetirementNumber)} ÷ 1.07^30 ={" "}
          <strong>{fmtUSD(exampleCoastNumber)}</strong>
        </p>
        <p>
          That means roughly {fmtUSD(exampleCoastNumber)} invested today, left alone for 30 years at a
          7% return, would grow into the full {fmtUSD(exampleRetirementNumber)} needed to retire on
          $60,000/year. The calculator above does this same math instantly with your own numbers.
        </p>
      </div>

      <Faq items={faqItems} />

      <WebApplicationSchema
        name="Coast Fire Number Calculator"
        description="Calculate your coast fire number — the amount needed invested today to coast to retirement."
        url="/coast-fire-number"
      />
    </>
  );
}
