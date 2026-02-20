import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { auth } from "@/app/libs/auth";
import { headers } from "next/headers";

interface Params {
  id: string;
  columnId: string;
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

  const { id: projectId, columnId } = await params;

  try {
    const body = await request.json();
    const column = await prisma.projectColumn.update({
      where: { id: columnId, projectId },
      data: {
        name: body.name,
        color: body.color,
        position: body.position,
      },
    });
    return NextResponse.json(column);
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

  const { id: projectId, columnId } = await params;

  try {
    // Find a fallback column (the first one that isn't the one being deleted)
    const fallbackColumn = await prisma.projectColumn.findFirst({
      where: {
        projectId,
        id: { not: columnId },
      },
      orderBy: { position: "asc" },
    });

    // If there's no fallback column, we might want to create one or handle it differently
    // In this case, we'll try to find "PARA HACER" or just create a new one if needed.
    // For now, let's assume every project has at least one column.

    if (fallbackColumn) {
      // Move tasks to fallback column
      await prisma.task.updateMany({
        where: { columnId },
        data: { columnId: fallbackColumn.id },
      });
    } else {
      // If no fallback, tasks will have null columnId
      await prisma.task.updateMany({
        where: { columnId },
        data: { columnId: null },
      });
    }

    await prisma.projectColumn.delete({
      where: { id: columnId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
