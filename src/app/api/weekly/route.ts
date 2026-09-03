import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { weeklyPlanProgress } from "@/lib/progress";
import { getWeekStart } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const plans = await prisma.weeklyPlan.findMany({
    orderBy: { weekStart: "desc" },
    include: { weeklyGoals: { orderBy: { order: "asc" } } },
    take: 20,
  });
  const withProgress = await Promise.all(
    plans.map(async (plan) => ({
      ...plan,
      progress: await weeklyPlanProgress(plan.id),
    }))
  );
  return NextResponse.json(withProgress);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { weekStart, memo, goalId, goals } = body ?? {};

  if (!weekStart) {
    return NextResponse.json({ error: "weekStart is required" }, { status: 400 });
  }

  const goalTexts: string[] = Array.isArray(goals)
    ? goals.filter((g: unknown) => typeof g === "string" && g.trim()).slice(0, 5)
    : [];

  try {
    const plan = await prisma.weeklyPlan.create({
      data: {
        weekStart: getWeekStart(new Date(weekStart)),
        memo: memo ?? null,
        goalId: goalId ?? null,
        weeklyGoals: {
          create: goalTexts.map((text, i) => ({ text: text.trim(), order: i })),
        },
      },
      include: { weeklyGoals: true },
    });
    return NextResponse.json(plan, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "a weekly plan for this week already exists" },
        { status: 409 }
      );
    }
    throw err;
  }
}
