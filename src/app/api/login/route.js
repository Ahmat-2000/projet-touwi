import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(request) {
  const { username, password } = await request.json();

  // Vérification des informations d'identification en dur (à des fins de démonstration uniquement)
  if (username === 'test' && password === 'test') {
    // Créer un token JWT
    const token = await new SignJWT({ username })
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
