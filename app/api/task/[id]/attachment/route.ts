import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { auth } from "@/app/libs/auth";
import { headers } from "next/headers";
import { minioClient, bucketName, ensureBucketExists } from "@/libs/minio";
import { v4 as uuidv4 } from "uuid";

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
    const { url: base64Data, name, type } = await request.json();

    // 1. Safety check: verify task belongs to user or collaborator
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        OR: [
          { userId: session.user.id },
          { collaborators: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // 2. Prepare MinIO
    await ensureBucketExists();

    // 3. Process base64
    const base64Image = base64Data.split(";base64,").pop();
    const buffer = Buffer.from(base64Image, "base64");
    const fileName = `${uuidv4()}-${name}`;

    // 4. Upload to MinIO
    await minioClient.putObject(bucketName, fileName, buffer, buffer.length, {
      "Content-Type":
        type === "image" ? "image/png" : "application/octet-stream",
    });

    // 5. Generate a public URL (or a local proxy URL if MinIO isn't public)
    // For now, let's construct the MinIO access URL
    const fileUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/files/${fileName}`;

    const attachment = await prisma.attachment.create({
      data: {
        url: fileUrl,
        name,
        type,
        taskId,
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("MinIO Upload Error:", error);
    return NextResponse.json(
      { error: "Error creating attachment or uploading to MinIO" },
      { status: 500 },
    );
  }
}
