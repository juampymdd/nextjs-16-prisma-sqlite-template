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

  const project = await prisma.project.findUnique({
    where: { id, userId: session.user.id },
    include: {
      tasks: {
        include: {
          subtasks: true,
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
