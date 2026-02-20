import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { auth } from "@/app/libs/auth";
import { headers } from "next/headers";
import { minioClient, bucketName, ensureBucketExists } from "@/libs/minio";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

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
    let buffer = Buffer.from(base64Image, "base64");
    let fileName = `${uuidv4()}-${name}`;
    let contentType =
      type === "image" ? "image/png" : "application/octet-stream";

    // 4. Optimize image with Sharp if it's an image
    if (type === "image") {
      try {
        const optimizedBuffer = await sharp(buffer)
          .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        buffer = Buffer.from(optimizedBuffer);
        // Update fileName extension to webp
        const originalName = name.substring(0, name.lastIndexOf(".")) || name;
        fileName = `${uuidv4()}-${originalName}.webp`;
        contentType = "image/webp";
      } catch (sharpError) {
        console.warn(
          "Sharp optimization failed, using original image:",
          sharpError,
        );
      }
    }

    // 5. Upload to MinIO
    await minioClient.putObject(bucketName, fileName, buffer, buffer.length, {
      "Content-Type": contentType,
    });

    // 6. Generate a public URL (or a local proxy URL if MinIO isn't public)
    // For now, let's construct the MinIO access URL
    const fileUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/files/${fileName}`;

    const attachment = await prisma.attachment.create({
      data: {
        url: fileUrl,
        name: fileName.split("-").slice(1).join("-"), // Use optimized name
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
