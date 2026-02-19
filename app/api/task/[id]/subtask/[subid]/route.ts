import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { auth } from "@/app/libs/auth";
import { headers } from "next/headers";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; subid: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subid } = await params;

  try {
    const { completed } = await request.json();
    const subtask = await prisma.subtask.update({
      where: { id: subid },
      data: { completed },
    });
    return NextResponse.json(subtask);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating subtask" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; subid: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subid } = await params;

  try {
    await prisma.subtask.delete({
      where: { id: subid },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting subtask" },
      { status: 400 },
    );
  }
}
