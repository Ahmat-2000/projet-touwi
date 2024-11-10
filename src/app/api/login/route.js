import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { handleRequest } from '@/utils/api/RequestUtils';

export async function POST(request) {
  const { username, password } = await handleRequest(request);

  if (!username || !password) {
    return NextResponse.json({ message: 'Veuillez fournir un nom d\'utilisateur et un mot de passe' }, { status: 400 });
  }

  // Récupérer l'utilisateur de la base de données
  const user = await prisma.user.findUnique({
    where: { username }, // Rechercher l'utilisateur par son nom d'utilisateur
  });

  // Vérification des informations d'identification
  if (user && await bcrypt.compare(password, user.password)) {
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