import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { auth } from "../../../libs/auth";
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

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      OR: [
        { userId: session.user.id },
        { collaborators: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      user: {
        select: { id: true, name: true, image: true, email: true },
      },
      collaborators: {
        include: {
          user: {
            select: { id: true, name: true, image: true, email: true },
          },
        },
      },
      columns: {
        orderBy: { position: "asc" },
      },
      tasks: {
        include: {
          subtasks: true,
          assignee: {
            select: { id: true, name: true, image: true, email: true },
          },
          collaborators: {
            include: {
              user: {
                select: { id: true, name: true, image: true },
              },
            },
          },
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // If project has no columns, create them (fallback for existing projects)
  if (project.columns.length === 0) {
    const defaultColumns = await Promise.all([
      prisma.projectColumn.create({
        data: {
          name: "PARA HACER",
          position: 0,
          color: "#3b82f6",
          projectId: project.id,
        },
      }),
      prisma.projectColumn.create({
        data: {
          name: "EN PROCESO",
          position: 1,
          color: "#eab308",
          projectId: project.id,
        },
      }),
      prisma.projectColumn.create({
        data: {
          name: "FINALIZADO",
          position: 2,
          color: "#22c55e",
          projectId: project.id,
        },
      }),
    ]);

    // Update tasks to use the new "PARA HACER" column by mapping status
    for (const task of project.tasks) {
      let targetColumnId = defaultColumns[0].id;
      if (task.status === "IN_PROGRESS") targetColumnId = defaultColumns[1].id;
      if (task.status === "DONE" || task.completed)
        targetColumnId = defaultColumns[2].id;

      await prisma.task.update({
        where: { id: task.id },
        data: { columnId: targetColumnId },
      });
    }

    // Refetch the project after adding columns
    const updatedProject = await prisma.project.findFirst({
      where: { id },
      include: {
        user: { select: { id: true, name: true, image: true, email: true } },
        collaborators: {
          include: {
            user: {
              select: { id: true, name: true, image: true, email: true },
            },
          },
        },
        columns: { orderBy: { position: "asc" } },
        tasks: {
          include: {
            subtasks: true,
            assignee: {
              select: { id: true, name: true, image: true, email: true },
            },
            collaborators: {
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
            },
          },
        },
      },
    });
    return NextResponse.json(updatedProject);
  }

  return NextResponse.json(project);
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
    const project = await prisma.project.update({
      where: { id, userId: session.user.id },
      data: {
        name: body.name,
        description: body.description,
        color: body.color,
        completed: body.completed,
        completedAt: body.completedAt,
      },
    });
    return NextResponse.json(project);
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
    await prisma.project.delete({
      where: { id, userId: session.user.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
