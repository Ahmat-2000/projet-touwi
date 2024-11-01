import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  // Récupère le token du cookie
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // Rediriger vers la page de connexion si le token est absent
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    request.user = payload.sub;
  } catch (err) {
    // Redirige vers la page de connexion si le token est invalide
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// On protège toutes les routes commençant par /api/protected
export const config = {
  matcher: ['/api/protected/:path*'],
};
