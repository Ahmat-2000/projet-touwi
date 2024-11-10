import { NextResponse } from 'next/server';
import { getWorkspaceIdFromRequest, getWorkspace } from '@/services/api/workspaceService';
import { getPermissions } from '@/services/api/permissionService';
import { getUserFromRequest } from '@/services/api/UserService';
import permissionsConfig from '@/app/api/permissionsConfig';

/**
 * Middleware to protect API routes with user permission verification.
 * @param {Request} request - HTTP request.
 * @returns {Promise<Response|void>} - Redirects to login or grants access.
 */
export async function middleware(request) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next(); // Proceed to the next middleware or route handler if authorized
}

// Middleware configuration to protect routes starting with /api/protected
export const config = {
  matcher: ['/api/protected/:path*'], // Apply this middleware only to protected routes
};
