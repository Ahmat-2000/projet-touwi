// app/api/protected/user/[id]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//
// TODO : Choisir une base de donnée et l'implémenter
//

/**
 * Cette fonction répond aux requêtes de type GET faites à l'api
 * localhost:3000/api/users/route.js 
 */
export async function GET(request, { params }) {
    const { id } = params; // Récupérer l'id de l'URL
  
    const user = await prisma.user.findUnique({ where: { id: Number(id) } }); // Récupérer l'utilisateur par ID
  
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }
  
    return NextResponse.json(user, { status: 200 });
}


export async function PUT(request, { params }) {
    const { id } = params; // Récupérer l'id de l'URL
    const body = await request.json(); // Récupérer les données JSON du corps de la requête

    const user = await prisma.user.findUnique({ where: { id: Number(id) } }); // Récupérer l'utilisateur par ID

    if (!user) {
        return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({ where: { id: Number(id) }, data: body });

    return NextResponse.json(updatedUser, { status: 200 });
}


export async function DELETE(request, { params }) {
    const { id } = params; // Récupérer l'id de l'URL

    const user = await prisma.user.findUnique({ where: { id: Number(id) } }); // Récupérer l'utilisateur par ID

    if (!user) {
        return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: 'Utilisateur supprimé' }, { status: 200 });
}