import * as Minio from "minio";

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

export const bucketName = process.env.MINIO_BUCKET || "task-attachments";

// Ayuda para asegurar que el bucket exista
export const ensureBucketExists = async () => {
  const exists = await minioClient.bucketExists(bucketName);
  if (!exists) {
    await minioClient.makeBucket(bucketName, "us-east-1");
    console.log(`Bucket "${bucketName}" creado correctamente en MinIO.`);
  }
};
