import { NextResponse } from "next/server";
import { prisma } from "@/app/libs/prisma";

interface Params {
  id: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  console.log({ id });
  const task = await prisma.task.findUnique({
    where: { id: Number(id) },
  });
  if (task) return NextResponse.json({ message: "Obteniendo Tarea", task });
  return NextResponse.json([]);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const { body } = request;
  console.log({ body });

  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id: Number(id) },
  });
  if (task)
    await prisma.task.update({
      where: { id: Number(id) },
      data: {},
    });
  return NextResponse.json({ message: "Actualizando Tarea", task });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  try {
    const task = await prisma.task.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Eliminando Tarea", task });
  } catch (error: any) {
    throw error;
  }
}
