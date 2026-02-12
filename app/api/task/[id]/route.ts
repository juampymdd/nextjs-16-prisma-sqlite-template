import { NextResponse } from "next/server";


interface params {
    id: string
}
export function GET(request: Request, { params }: { params: params }) {
    
    return NextResponse.json({ message: "Obteniendo Tarea", id: params.id });
}

export function PUT(request: Request, { params }: { params: params }) {

    return NextResponse.json({ message: "Actualizando Tarea", id: params.id });
}

export function DELETE(request: Request, { params }: { params: params }) {

    return NextResponse.json({ message: "Eliminando Tarea", id: params.id });
}