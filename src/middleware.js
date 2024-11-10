import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/services/api/UserService';

/**
 * Middleware to protect API routes with user permission verification.
 * @param {Request} request - HTTP request.
 * @returns {Promise<Response|void>} - Redirects to login or grants access.
 */
export async function middleware(request) {

  // Retrieve number of users from the database
  const response = await fetch(`${process.env.BACKEND_API_URL}/install`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if(!response.ok) return NextResponse.error({ message: 'Database error' }, 404);
  const userCount = await response.json();
  if(!userCount) return NextResponse.error({ message: 'Database error' }, 404);
  if(userCount.count === 0 && request.url.includes('install')) {
    return NextResponse.next();
  }
  if(userCount.count === 0) {
    return NextResponse.redirect(new URL('/install', request.url));
  }


  const user = await getUserFromRequest(request);

  if (!user && request.url.includes('login')) {
    return NextResponse.next();
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if(request.url.includes('install')) return NextResponse.redirect(new URL('/import', request.url));

  return NextResponse.next(); // Proceed to the next middleware or route handler if authorized
}

// Middleware configuration to protect routes starting with /api/protected
export const config = {
  matcher: ['/api/protected/:path*', '/install', '/import', '/login'], // Apply this middleware only to protected routes
};
