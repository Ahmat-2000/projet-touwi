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

  // Retrieve workspace context from the request, if applicable
  const workspaceId = await getWorkspaceIdFromRequest(request);
  const workspace = await getWorkspace(workspaceId);
  const permissions = await getPermissions(user, workspace);

  // Retrieve the route from the request and standardize the path format
  let requestedPath = request.nextUrl.pathname;
  const requestMethod = request.method.toUpperCase();
  requestedPath = requestedPath.replace(/\/\d+$/, "/id");
  const routePermissions = Object.keys(permissionsConfig).find((route) => route === requestedPath);
  if (!routePermissions || !permissionsConfig[routePermissions][requestMethod]) {
    throw new Error("Route or method not found in permissions configuration. (Check permissionsConfig.js)");
  }

  // Check if the user's permissions meet the requirements for the route and method
  const hasPermission = permissionsConfig[routePermissions][requestMethod].some(role =>
    permissions.includes(role)
  );

  // Deny access if permissions are insufficient
  if (!hasPermission) {
     return NextResponse.json({ message: 'Access denied: insufficient permissions.' },{ status: 403 });
  }

  return NextResponse.next(); // Proceed to the next middleware or route handler if authorized
}

// Middleware configuration to protect routes starting with /api/protected
export const config = {
  matcher: ['/api/protected/:path*'], // Apply this middleware only to protected routes
};
