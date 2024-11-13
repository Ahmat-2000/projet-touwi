import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { handleRequest } from "@/utils/api/RequestUtils";
import bcrypt from 'bcrypt';

export async function GET(request) {
    const userCount = await prisma.user.count();
    return NextResponse.json({ count: userCount });
}

export async function POST(request) {
    const userCount = await prisma.user.count();
    if(userCount) return NextResponse.error({ message: 'Database error' }, 404);
    if(!request.body) return NextResponse.error({ message: 'No body found in request' }, 400);
    if(userCount > 0) return NextResponse.error({ message: 'Database error' }, 404);

    const body = await handleRequest(request);
    
    if(!body.username || !body.password) return NextResponse.error({ message: 'Username and password are required' }, 400);
    const cryptedPassword = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
        data: {
            username: body.username,
            password: cryptedPassword,
            is_admin: true,
        }
    });
    return NextResponse.json({ user });

  }