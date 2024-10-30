import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcrypt'; 

export async function POST(request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ message: 'Veuillez fournir un nom d\'utilisateur et un mot de passe' }, { status: 400 });
  }

  // Vérification des informations d'identification
  if (username == "test" && password == "test") {
    // Créer un token JWT avec l'ID de l'utilisateur avec payload `sub`
    const token = await new SignJWT({ sub: 2 })
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