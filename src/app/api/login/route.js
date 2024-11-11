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

  // Search for the user by their username
  const user = await prisma.user.findUnique({
    where: { username }, // Rechercher l'utilisateur par son nom d'utilisateur
  });

  // If the user exists and the password is correct
  if (user && await bcrypt.compare(password, user.password)) {
    // Create a JWT token
    const token = await new SignJWT({ sub: user })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(process.env.TOKEN_EXPIRATION)
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    // Créer une réponse et définir le cookie
    const response = NextResponse.json({ token });
    
    response.cookies.set(
      'token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/', 
      maxAge: 30 * 24 * 60,
    });

    return response;
  } else {
    return NextResponse.json({ message: 'Identifiants invalides' }, { status: 401 });
  }
}