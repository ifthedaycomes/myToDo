import { prisma } from "@/lib/prisma";

export async function weeklyPlanProgress(weeklyPlanId: string): Promise<number> {
  const total = await prisma.todo.count({ where: { weeklyPlanId } });
  if (total === 0) return 0;
  const done = await prisma.todo.count({ where: { weeklyPlanId, status: "done" } });
  return Math.round((done / total) * 100);
}

export async function goalProgress(goalId: string): Promise<number> {
  const weeklyPlans = await prisma.weeklyPlan.findMany({
    where: { goalId },
    select: { id: true },
  });
  if (weeklyPlans.length === 0) return 0;
  const progresses = await Promise.all(
    weeklyPlans.map((wp) => weeklyPlanProgress(wp.id))
  );
  const sum = progresses.reduce((a, b) => a + b, 0);
  return Math.round(sum / progresses.length);
}
