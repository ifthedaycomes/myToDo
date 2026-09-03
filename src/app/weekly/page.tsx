import { requireUser } from "@/lib/auth";
import { WeeklyListView } from "./WeeklyListView";

export default async function WeeklyListPage() {
  await requireUser();
  return <WeeklyListView />;
}
