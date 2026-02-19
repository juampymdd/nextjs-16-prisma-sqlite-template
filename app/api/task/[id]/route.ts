import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { auth } from "@/app/libs/auth";
import { headers } from "next/headers";

interface Params {
  id: string;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const task = await prisma.task.update({
      where: { id, userId: session.user.id },
      data: {
        title: body.title,
        description: body.description,
        completed: body.completed,
        completedAt:
          body.completed !== undefined
            ? body.completed
              ? new Date()
              : null
            : undefined,
        status: body.status,
        priority: body.priority,
        position: body.position,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        projectId: body.projectId === "none" ? null : body.projectId,
      },
    });
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { error: "Task not found or unauthorized" },
      { status: 404 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.task.delete({
      where: { id, userId: session.user.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Task not found or unauthorized" },
      { status: 404 },
    );
  }
}
