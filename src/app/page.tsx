import { requireUser } from "@/lib/auth";
import { DashboardView } from "./DashboardView";

export default async function DashboardPage() {
  await requireUser();
  return <DashboardView />;
}
