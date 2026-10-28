import { AcademicPlanner } from "@/components/planner/AcademicPlanner";
import { QuickCalculator } from "@/components/QuickCalculator";

export default function HomePage() {
  return <AcademicPlanner quickCalculator={<QuickCalculator />} />;
}
