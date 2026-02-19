import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { auth } from "@/app/libs/auth";
import { headers } from "next/headers";

export async function GET() {
  console.log("GET /api/task - ENTER");
  let session;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
    console.log("GET /api/task - Session retrieved:", !!session);
  } catch (authError: any) {
    console.error("GET /api/task - AUTH ERROR:", authError);
    return NextResponse.json(
      { error: "Auth Error", details: authError.message },
      { status: 500 },
    );
  }

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("GET /api/task - Querying tasks for:", session.user.id);
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { collaborators: { some: { userId: session.user.id } } },
        ],
      },
      include: {
        subtasks: true,
        attachments: true,
        project: true,
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });
    console.log("GET /api/task - Tasks found:", tasks.length);
    return NextResponse.json(tasks);
  } catch (dbError: any) {
    console.error("GET /api/task - DB ERROR:", dbError);
    return NextResponse.json(
      {
        error: "Database Error",
        details: dbError.message,
        code: dbError.code,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    const isCompleted = body.completed || body.status === "DONE" || false;

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority || "medium",
        status: body.status || "TODO",
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        userId: session.user.id,
        projectId: body.projectId,
      },
    });
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
