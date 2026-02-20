import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";
import { auth } from "@/app/libs/auth";
import { headers } from "next/headers";
import { minioClient, bucketName } from "@/libs/minio";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; attachmentId: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: taskId, attachmentId } = await params;

  try {
    // 1. Verify attachment belongs to the task and the user has access
    const attachment = await prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        taskId: taskId,
        task: {
          OR: [
            { userId: session.user.id },
            { collaborators: { some: { userId: session.user.id } } },
          ],
        },
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 },
      );
    }

    // 2. Extract fileName from URL to delete from MinIO
    // URL format: http://localhost:3000/api/files/FILENAME
    const fileName = attachment.url.split("/").pop();

    if (fileName) {
      try {
        await minioClient.removeObject(bucketName, fileName);
      } catch (minioError) {
        console.error("Error deleting from MinIO:", minioError);
        // We continue even if MinIO fails, to keep DB in sync
      }
    }

    // 3. Delete from DB
    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Attachment Error:", error);
    return NextResponse.json(
      { error: "Error deleting attachment" },
      { status: 500 },
    );
  }
}
