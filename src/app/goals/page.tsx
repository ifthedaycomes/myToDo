import { requireUser } from "@/lib/auth";
import { GoalsView } from "./GoalsView";

export default async function GoalsPage() {
  await requireUser();
  return <GoalsView />;
}
