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

    // Check if user has access to this task
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          { assigneeId: session.user.id },
          { collaborators: { some: { userId: session.user.id } } },
          {
            project: {
              OR: [
                { userId: session.user.id },
                { collaborators: { some: { userId: session.user.id } } },
              ],
            },
          },
        ],
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Validate assignee if provided
    if (body.assigneeId) {
      const projectWithMembers = await prisma.project.findFirst({
        where: {
          id: existingTask.projectId,
          OR: [
            { userId: body.assigneeId },
            { collaborators: { some: { userId: body.assigneeId } } },
          ],
        },
      });

      if (!projectWithMembers) {
        return NextResponse.json(
          { error: "Assignee must be a project member" },
          { status: 400 },
        );
      }
    }

    const task = await prisma.task.update({
      where: { id },
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
        projectId: body.projectId === "none" ? undefined : body.projectId,
        assigneeId: body.assigneeId,
      },
    });
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
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
    // Only creator or project owner can delete
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          { project: { userId: session.user.id } },
        ],
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
