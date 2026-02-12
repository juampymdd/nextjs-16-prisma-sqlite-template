import { NextResponse } from "next/server";

export function GET() {
    return NextResponse.json({ message: "Obteniendo Tareas" });
}


export function POST() {
    return NextResponse.json({ message: "Creando Tarea" });
}

export function PUT() {
    return NextResponse.json({ message: "Actualizando Tarea" });
}

export function DELETE() {
    return NextResponse.json({ message: "Eliminando Tarea" });
}