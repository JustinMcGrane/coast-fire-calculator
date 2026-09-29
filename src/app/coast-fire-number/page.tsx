import type { Metadata } from "next";
import Hero from "@/components/Hero";
import CoastCalculator from "@/components/CoastCalculator";
import Faq from "@/components/Faq";
import { createClient } from "@/lib/supabase/server";
import { fmtUSD } from "@/lib/coastfire";

export const metadata: Metadata = {
  title: "Coast Fire Number Calculator — Calculate Your Coast Fire Number",
  description:
    "Free coast fire number calculator — no signup needed. Find the exact dollar amount you need invested today to coast to retirement, with a worked example.",
  alternates: { canonical: "/coast-fire-number" },
  openGraph: {
    title: "Coast Fire Number Calculator",
    description: "Free, no signup needed — calculate the exact amount you need invested today to coast to retirement.",
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
  {
    question: "What should I do once I've reached my coast fire number?",
    answer:
      "Reaching it means your current invested savings, left alone, are on track to hit your full retirement number by your target age. From there it's a choice: keep contributing to retire earlier or build in more cushion, or redirect that money elsewhere — paying down debt, a career change, or spending more now. Many people choose a middle path and keep contributing at a lower rate rather than stopping entirely.",
  },
  {
    question: "How often should I recalculate my coast fire number?",
    answer:
      "At least once a year, or any time something meaningful changes — a raise, a market swing that moves your savings balance significantly, a change in when you want to retire, or a change in your expected return assumption. The number isn't fixed; it shifts as your inputs do.",
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
          Your coast fire number is the exact dollar amount you need invested today — with no
          further contributions — for compound growth alone to carry it to your full retirement
          number by your target retirement age. It comes from two steps: first find your{" "}
          <strong>retirement number</strong> (desired annual spending divided by your safe
          withdrawal rate), then discount that number back to today using your expected annual
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
        <h3>What your coast fire number actually means</h3>
        <p>
          Your coast fire number isn&apos;t a finish line for saving — it&apos;s a threshold. Below it,
          you still need to keep contributing for your retirement plan to stay on track; above it,
          continued growth alone is enough, and any further contributions just add a margin of safety
          or pull your retirement date earlier. Crossing it doesn&apos;t mean you&apos;re done working or
          done saving in general — it means your retirement savings specifically no longer require new
          money to hit their target. Most people who reach this point either keep contributing anyway
          (to retire sooner or with more cushion) or redirect that money toward other goals, like paying
          down a mortgage faster, funding a career change, or simply spending more today.
        </p>
        <p>
          Two inputs move your coast fire number more than any other: your{" "}
          <strong>expected annual return</strong> and your <strong>time horizon</strong>. A higher
          assumed return lowers the number sharply, since more of the work happens through compounding
          rather than contributions — but it also means the year-to-year path is less certain, so many
          people intentionally use a slightly conservative return estimate rather than a long-run market
          average to stay realistic. Time horizon matters just as much: someone 30 years from retirement
          needs far less invested today than someone 10 years out, since compounding has decades rather
          than years to close the gap. Your safe withdrawal rate and desired retirement spending also
          matter, but indirectly — they set your retirement number first, before the discounting step
          even happens. Because all of these inputs shift over time, it&apos;s worth recalculating your
          coast fire number at least once a year, or any time your savings, income, or retirement
          timeline changes meaningfully.
        </p>
      </div>

      <Faq items={faqItems} />
    </>
  );
}
