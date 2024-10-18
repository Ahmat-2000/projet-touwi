// app/api/protected/workspace/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Cette fonction répond aux requêtes de type GET faites à l'api
 * localhost:3000/api/users/route.js 
 */
export async function GET(request) {
  const users = await prisma.user.findMany(); // Récupérer tous les utilisateurs
  return NextResponse.json(users, { status: 200 });
}


/**
 * Cette fonction répond aux requêtes de type POST faites à l'api
 * localhost:3000/api/user/route.js 
 */
export async function POST(request) {
  try {
    const body = await request.json(); // Récupérer les données JSON du corps de la requête

    // Créer un nouvel utilisateur
    const user = await prisma.user.create({ data: body });

    return NextResponse.json(user, { status: 201 }); // Retourne l'utilisateur créé avec le code de statut 201
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Erreur lors de la création de l\'utilisateur.' }, { status: 500 });
  }
}