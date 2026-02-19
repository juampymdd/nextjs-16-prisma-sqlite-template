import { prisma } from "@/app/libs";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { registerSchema } from "@/libs/schemas/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Datos de registro inválidos",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, email, password, image } = validation.data;

    let processedImg = image;

    if (image && image.startsWith("data:image")) {
      // Extraer los datos base64
      const base64Data = image.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");

      // Redimensionar la imagen con sharp
      const resizedBuffer = await sharp(buffer)
        .resize(200, 200, { fit: "cover" }) // 200x200 es suficiente para un avatar
        .webp({ quality: 80 }) // Convertir a webp para optimizar peso
        .toBuffer();

      processedImg = `data:image/webp;base64,${resizedBuffer.toString("base64")}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        image: processedImg,
      },
    });

    // Crear la cuenta (requerido por Better-Auth si se usa password)
    await prisma.account.create({
      data: {
        id: Math.random().toString(36).substring(7),
        userId: newUser.id,
        accountId: email,
        providerId: "credential",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Usuario creado correctamente", userId: newUser.id },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error en registro:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "El email ya está registrado." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
