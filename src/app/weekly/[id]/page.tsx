import { requireUser } from "@/lib/auth";
import { WeeklyDetailView } from "./WeeklyDetailView";

export default async function WeeklyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  return <WeeklyDetailView id={id} />;
}
