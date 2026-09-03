import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo || todo.userId !== user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(todo);
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
  const { title, description, priority, dueDate, dayOfWeek, weeklyPlanId, goalId } =
    body ?? {};

  if (title !== undefined && (!title || typeof title !== "string" || !title.trim())) {
    return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
  }

  const existing = await prisma.todo.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const todo = await prisma.todo.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(priority !== undefined ? { priority } : {}),
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      ...(dayOfWeek !== undefined ? { dayOfWeek } : {}),
      ...(weeklyPlanId !== undefined ? { weeklyPlanId } : {}),
      ...(goalId !== undefined ? { goalId } : {}),
    },
  });

  return NextResponse.json(todo);
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
  const { status, order } = body ?? {};

  const existing = await prisma.todo.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (status === undefined && order === undefined) {
    return NextResponse.json({ error: "status or order is required" }, { status: 400 });
  }

  const todo = await prisma.todo.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(order !== undefined ? { order } : {}),
    },
  });

  return NextResponse.json(todo);
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
  const existing = await prisma.todo.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  await prisma.todo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
