import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { auth } from "@/app/libs/auth";
import { headers } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: taskId } = await params;

  try {
    const { email } = await request.json();

    const userToInvite = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToInvite) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if task exists and user has permission (owner or already collaborator)
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { collaborators: true },
    });

    if (
      !task ||
      (task.userId !== session.user.id &&
        !task.collaborators.some((c) => c.userId === session.user.id))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const collaborator = await prisma.taskCollaborator.create({
      data: {
        taskId,
        userId: userToInvite.id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json(collaborator);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Ya es colaborador" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Error adding collaborator" },
      { status: 400 },
    );
  }
}
