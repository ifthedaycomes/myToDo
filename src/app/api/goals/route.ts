import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { goalProgress } from "@/lib/progress";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const goals = await prisma.goal.findMany({ orderBy: { createdAt: "asc" } });
  const withProgress = await Promise.all(
    goals.map(async (goal) => ({
      ...goal,
      progress: await goalProgress(goal.id),
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
  const { title, description } = body ?? {};

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const goal = await prisma.goal.create({
    data: { title: title.trim(), description: description ?? null },
  });

  return NextResponse.json(goal, { status: 201 });
}
