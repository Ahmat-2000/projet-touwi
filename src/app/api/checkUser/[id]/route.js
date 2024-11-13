import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params}) {
    const id = parseInt(params.id);
    const user = await prisma.user.findUnique({where: {id}});
    if(!user) return NextResponse.json({ userExist: false });
    return NextResponse.json({ userExist: true });
}