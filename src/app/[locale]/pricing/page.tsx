import PricingCards from "./PricingCards";
import PlanComparison from "./PlanComparison";
import PricingFAQ from "./PricingFAQ";

export const metadata = {
  title: "Pricing · Choose your plan",
  description: "Autonomy for all. Choose the best plan for you.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <PricingCards />
      <PlanComparison />
      <PricingFAQ />
    </main>
  );
}
