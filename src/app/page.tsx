import type { Metadata } from "next";
import Hero from "@/components/Hero";
import CoastCalculator from "@/components/CoastCalculator";
import Faq from "@/components/Faq";
import WebApplicationSchema from "@/components/WebApplicationSchema";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Coast FIRE Calculator — Find Your Coast FIRE Number",
  description:
    "Free coast fire calculator (also known as a coastfire or coast FI calculator): find the exact amount you need invested today to coast to retirement, with a chart showing your coast point.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Coast FIRE Calculator — Find Your Coast FIRE Number",
    description:
      "Find the exact amount you need invested today to coast to retirement — no more contributions required.",
    url: "/",
  },
};

const faqItems = [
  {
    question: "What is Coast FIRE?",
    answer:
      "Coast FIRE is the point where your current invested savings, left completely untouched, will grow through compound returns alone into the amount you need for retirement. Once you hit it, you no longer have to save for retirement — you can \"coast,\" covering just your current living expenses, and still retire on schedule.",
  },
  {
    question: "How is the coast fire number calculated?",
    answer:
      "First we calculate your retirement number: desired annual spending divided by your safe withdrawal rate. Then we discount that number back to today using your expected annual return, compounded over the years between now and your target retirement age. That discounted value is your coast FIRE number — what you'd need invested right now, with no further contributions, to reach your retirement number on schedule.",
  },
  {
    question: "Is a coast fire calculator the same as a coastfire or coast FI calculator?",
    answer:
      "Yes — \"coast fire calculator,\" \"coastfire calculator,\" and \"coast FI calculator\" (FI = Financial Independence, without the \"retire early\") all describe the same tool and the same math. This calculator covers all of them: enter your numbers once and get your coast number, your projected coast age, and a chart comparing full contributions against coasting.",
  },
  {
    question: "What if I haven't reached Coast FIRE yet?",
    answer:
      "The calculator shows the age at which your continued contributions will cross your required coast number, assuming your expected return holds. After that point, you could stop contributing entirely and still reach your retirement number by compounding alone.",
  },
  {
    question: "Does this account for inflation?",
    answer:
      "This version uses nominal (non-inflation-adjusted) dollars for simplicity, similar to most FIRE calculators. If you want a real (inflation-adjusted) result, use a lower expected annual return — for example, a 7% nominal return roughly corresponds to a 4-5% real return after typical long-run inflation.",
  },
  {
    question: "Is this financial advice?",
    answer:
      "No. This tool provides estimates based on constant assumed returns and constant contributions; real markets are volatile and don't move in a straight line. Premium's Monte Carlo simulation shows a range of possible outcomes for that reason. Consult a financial advisor for personalized advice.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Hero
        eyebrow="Coast FIRE Calculator"
        title="Find your"
        emphasis="coast"
        subhead="The moment your savings can grow to retirement on their own — no more contributions required. Everything after that is just the current carrying you in. Also known as a coastfire calculator, a fire coast calculator, or a coast FI calculator — same math, same tool."
      />
      <CoastCalculator isSignedIn={!!user} />

      <div className="content-section">
        <h2>What is Coast FIRE?</h2>
        <p>
          Coast FIRE (Financial Independence, Retire Early) is the point at which your current
          invested savings, left completely alone, will compound into your full retirement number by
          your target retirement age — with no further contributions. Reach it, and every dollar you
          were putting toward retirement is now free for today: you only need to earn enough to cover
          current living expenses.
        </p>
        <h3>How your coast number is calculated</h3>
        <p>
          We start with your <strong>retirement number</strong>: desired annual spending in
          retirement divided by your safe withdrawal rate. We then discount that number back to today
          using your expected annual return, compounded over the years remaining until your target
          retirement age. The result is your <strong>coast FIRE number</strong> — what you&apos;d need
          invested right now, untouched, to get there on growth alone.
        </p>
        <h3>Coast plan vs. full contributions</h3>
        <p>
          The chart above plots two paths: continuing your current monthly contributions all the way
          to retirement, and a &quot;coast plan&quot; where you contribute only until your coast point,
          then let compounding do the rest. Both should land at or above your retirement target — the
          coast plan just gets you there with less required from your future self.
        </p>
      </div>

      <Faq items={faqItems} />

      <WebApplicationSchema
        name="Coast FIRE Calculator"
        description="Free calculator for finding your Coast FIRE number — the amount you need invested today to coast to retirement."
        url="/"
      />
    </>
  );
}
