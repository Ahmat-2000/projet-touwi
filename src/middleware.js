import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getWorkspaceFromRequest } from '@/services/api/workspaceService';
import { getPermissions } from '@/services/api/permissionService';
import permissionsConfig from '@/app/api/permissionsConfig';

/**
 * Middleware to protect API routes with user permission verification.
 * @param {Request} request - HTTP request.
 * @returns {Promise<Response|void>} - Redirects to login or grants access.
 */
export async function middleware(request) {
  // Récupère le JWT et le vérifie (étapes similaires à votre code existant)
  const token = request.cookies.get('token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) return NextResponse.redirect(new URL('/login', request.url));

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secretKey));
    const user = payload.sub;
    if (!user) return NextResponse.redirect(new URL('/login', request.url));

    const workspace = await getWorkspaceFromRequest(request);
    const permissions = await getPermissions(user, workspace);

    let requestedPath = request.nextUrl.pathname;
    const requestMethod = request.method.toUpperCase();

    requestedPath = requestedPath.replace(/\/\d+$/, "/id");

    console.log('Requested path:', requestedPath);

    // Récupère les permissions de la route
    const routePermissions = Object.keys(permissionsConfig).find((route) => route === requestedPath);

    // Vérifie si l'utilisateur a les permissions pour cette route
    if (!routePermissions || !permissionsConfig[routePermissions][requestMethod]) {
      throw new Error("Route or method not found in permissions configuration. (Check permissionsConfig.js)");
    }

    const hasPermission = permissionsConfig[routePermissions][requestMethod].some(role =>
      permissions.includes(role)
    );

    if (!hasPermission) {
      return NextResponse.json({ message: 'Access denied: insufficient permissions.' },{ status: 403 });
    }

    return NextResponse.next();
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}


// Middleware configuration to protect routes starting with /api/protected
export const config = {
  matcher: ['/api/protected/:path*'], // Only apply this middleware to protected routes
};
