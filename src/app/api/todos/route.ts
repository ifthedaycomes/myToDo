import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nextOrderKey } from "@/lib/fractionalIndex";
import { getCurrentUser } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const weeklyPlanId = searchParams.get("weeklyPlanId");
  const goalId = searchParams.get("goalId");

  const where: Prisma.TodoWhereInput = { userId: user.id };
  if (status) where.status = status as Prisma.TodoWhereInput["status"];
  if (weeklyPlanId) where.weeklyPlanId = weeklyPlanId;
  if (goalId) where.goalId = goalId;

  const todos = await prisma.todo.findMany({
    where,
    orderBy: [{ status: "asc" }, { order: "asc" }],
  });

  return NextResponse.json(todos);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    title,
    description,
    status = "todo",
    priority = "medium",
    dueDate,
    dayOfWeek,
    weeklyPlanId,
    goalId,
  } = body ?? {};

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const last = await prisma.todo.findFirst({
    where: { status, userId: user.id },
    orderBy: { order: "desc" },
  });
  const order = nextOrderKey(last?.order ?? null);

  const todo = await prisma.todo.create({
    data: {
      title: title.trim(),
      description: description ?? null,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      dayOfWeek: dayOfWeek ?? null,
      weeklyPlanId: weeklyPlanId ?? null,
      goalId: goalId ?? null,
      order,
      userId: user.id,
    },
  });

  return NextResponse.json(todo, { status: 201 });
}
