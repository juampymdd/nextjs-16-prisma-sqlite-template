import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { auth } from "@/app/libs/auth";
import { headers } from "next/headers";

interface Params {
  id: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: taskId } = await params;

  try {
    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: {
          select: { id: true, name: true, image: true, email: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 400 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: taskId } = await params;

  try {
    const body = await request.json();
    
    // Check if task exists and user has access
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
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

    if (!task) {
      return NextResponse.json({ error: "Task not found or unauthorized" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: body.content,
        taskId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true, email: true },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 400 });
  }
}
