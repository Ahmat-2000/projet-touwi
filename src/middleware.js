import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/services/api/UserService';
import { redirect } from 'next/dist/server/api-utils';
import { SignJWT, jwtVerify } from 'jose';

/**
 * Middleware to protect API routes with user permission verification.
 * @param {Request} request - HTTP request.
 * @returns {Promise<Response|void>} - Redirects to login or grants access.
 */
export async function middleware(request) {

  // Retrieve number of users from the database
  const responseCount = await fetch(`${process.env.BACKEND_API_URL}/install`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if(!responseCount.ok) return NextResponse.error({ message: 'Database error' }, 404);
  const userCount = await responseCount.json();
  if(!userCount) return NextResponse.error({ message: 'Database error' }, 404);
  if(userCount.count === 0 && request.url.includes('install')) return NextResponse.next();
  if(userCount.count === 0) return NextResponse.redirect(new URL('/install', request.url));

  const user = await getUserFromRequest(request);
  if (!user && request.url.includes('login')) return NextResponse.next();
  if (!user) return NextResponse.json({ redirect: '/login' }, { status: 401 });
  if(request.url.includes('install')) return NextResponse.redirect(new URL('/import', request.url));

  //Check if user is in the database
  const responseCheckUser = await fetch(`${process.env.BACKEND_API_URL}/checkUser/${user.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if(!responseCheckUser.ok) return NextResponse.error({ message: 'Database error' }, 404);
  const {userExist} = await responseCheckUser.json();
  if(!userExist) {
    const response = NextResponse.json({ redirect: '/login' }, { status: 401 });
    response.cookies.delete('token');
    return response;
  }

  const token = request.cookies.get('token');
  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  const payload = await jwtVerify(token.value, new TextEncoder().encode(process.env.JWT_SECRET));

  const expTime = payload.exp * 1000; // Convert expiration time to milliseconds
  const currentTime = Date.now();

  if (expTime - currentTime <= 60 * 60 * 1000) { // If token expires in less than 1 hour
    // Create a new token with the same payload and expiration time
    const newToken = await new SignJWT({ sub: user })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(process.env.TOKEN_EXPIRATION)
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    // Set the cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
      maxAge: 30 * 24 * 60, // 30 days
    };

    // Return the response with the new token in the cookie
    const response = NextResponse.next();
    response.headers.set(
      'Set-Cookie',
      `token=${newToken}; Path=${cookieOptions.path}; HttpOnly; Secure=${cookieOptions.secure}; SameSite=${cookieOptions.sameSite}; Max-Age=${cookieOptions.maxAge}`
    );

    return response;
  }

  return NextResponse.next(); // Proceed to the next middleware or route handler if authorized
}

// Middleware configuration to protect routes starting with /api/protected
export const config = {
  matcher: ['/api/protected/:path*', '/install', '/import', '/login'], // Apply this middleware only to protected routes
};
