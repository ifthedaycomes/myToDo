import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { weeklyPlanProgress } from "@/lib/progress";
import { getWeekStart } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const plan = await prisma.weeklyPlan.findUnique({
    where: { id },
    include: {
      weeklyGoals: { orderBy: { order: "asc" } },
      todos: { where: { userId: user.id } },
    },
  });
  if (!plan) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ...plan, progress: await weeklyPlanProgress(id) });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { memo, retrospective, goalId, weekStart, goals } = body ?? {};

  const existing = await prisma.weeklyPlan.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (Array.isArray(goals)) {
    const goalTexts: string[] = goals
      .filter((g: unknown) => typeof g === "string" && g.trim())
      .slice(0, 5)
      .map((g: string) => g.trim());
    const existingGoals = await prisma.weeklyGoal.findMany({
      where: { weeklyPlanId: id },
      orderBy: { order: "asc" },
    });

    await Promise.all(
      goalTexts.map((text, i) =>
        existingGoals[i]
          ? prisma.weeklyGoal.update({ where: { id: existingGoals[i].id }, data: { text } })
          : prisma.weeklyGoal.create({ data: { text, order: i, weeklyPlanId: id } })
      )
    );

    if (existingGoals.length > goalTexts.length) {
      await prisma.weeklyGoal.deleteMany({
        where: { id: { in: existingGoals.slice(goalTexts.length).map((g) => g.id) } },
      });
    }
  }

  try {
    const plan = await prisma.weeklyPlan.update({
      where: { id },
      data: {
        ...(memo !== undefined ? { memo } : {}),
        ...(retrospective !== undefined ? { retrospective } : {}),
        ...(goalId !== undefined ? { goalId } : {}),
        ...(weekStart !== undefined ? { weekStart: getWeekStart(new Date(weekStart)) } : {}),
      },
      include: { weeklyGoals: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json(plan);
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { weeklyGoalId, done } = body ?? {};

  if (!weeklyGoalId || typeof done !== "boolean") {
    return NextResponse.json(
      { error: "weeklyGoalId and done (boolean) are required" },
      { status: 400 }
    );
  }

  const weeklyGoal = await prisma.weeklyGoal.findUnique({ where: { id: weeklyGoalId } });
  if (!weeklyGoal || weeklyGoal.weeklyPlanId !== id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const updated = await prisma.weeklyGoal.update({
    where: { id: weeklyGoalId },
    data: { done },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.weeklyPlan.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  await prisma.weeklyPlan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
