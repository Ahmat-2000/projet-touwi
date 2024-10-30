import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // Assurez-vous d'utiliser bcrypt pour le hachage des mots de passe

const prisma = new PrismaClient();

export async function POST(request) {
  const { username, password } = await request.json();

  // Récupérer l'utilisateur de la base de données
  const user = await prisma.user.findUnique({
    where: { username }, // Rechercher l'utilisateur par son nom d'utilisateur
  });

  // Vérification des informations d'identification
  if (user && await bcrypt.compare(password, user.password)) {
    console.log('Token généré avec sub:', user);
    // Créer un token JWT avec l'ID de l'utilisateur (payload.sub)
    const token = await new SignJWT({ sub: user }) // Utiliser l'ID de l'utilisateur pour le champ `sub`
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    // Créer une réponse et définir le cookie
    const response = NextResponse.json({ token });
    response.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 }); // Cookie HTTP-only d'une durée d'une heure

    return response;
  } else {
    return NextResponse.json({ message: 'Identifiants invalides' }, { status: 401 });
  }
}
