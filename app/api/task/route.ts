import { NextResponse } from "next/server";
 

export function GET(request: Request) {

    return NextResponse.json({ message: "Obteniendo Tareas" });
}


export function POST(request: Request) {
    return NextResponse.json({ message: "Creando Tarea" });
}


