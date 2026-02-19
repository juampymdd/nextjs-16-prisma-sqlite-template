import { NextResponse } from "next/server";
import { minioClient, bucketName } from "@/libs/minio";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  try {
    const dataStream = await minioClient.getObject(bucketName, filename);

    // We can use a ReadableStream to pipe the data
    const stream = new ReadableStream({
      async start(controller) {
        dataStream.on("data", (chunk) => controller.enqueue(chunk));
        dataStream.on("end", () => controller.close());
        dataStream.on("error", (err) => controller.error(err));
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "image/png", // You might want to store mimetype in DB or metadata
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
