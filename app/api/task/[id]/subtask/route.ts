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
    const { title } = await request.json();
    const subtask = await prisma.subtask.create({
      data: {
        title,
        taskId,
      },
    });
    return NextResponse.json(subtask);
  } catch (error) {
    return NextResponse.json(
      { error: "Error adding subtask" },
      { status: 400 },
    );
  }
}
