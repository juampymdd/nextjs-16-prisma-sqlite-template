import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { auth } from "@/app/libs/auth";
import { headers } from "next/headers";

interface Params {
  id: string;
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

  const { id: projectId } = await params;

  // Check if project exists and user has access
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { userId: session.user.id },
        { collaborators: { some: { userId: session.user.id } } },
      ],
    },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Project not found or unauthorized" },
      { status: 404 },
    );
  }

  try {
    const body = await request.json();

    // Get max position to append
    const lastColumn = await prisma.projectColumn.findFirst({
      where: { projectId },
      orderBy: { position: "desc" },
    });

    const position = lastColumn ? lastColumn.position + 1 : 0;

    const column = await prisma.projectColumn.create({
      data: {
        name: body.name,
        color: body.color || "#3b82f6",
        position,
        projectId,
      },
    });

    return NextResponse.json(column);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create column" },
      { status: 400 },
    );
  }
}
