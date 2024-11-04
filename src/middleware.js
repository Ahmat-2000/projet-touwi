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
  // Retrieve the JWT from cookies
  const token = request.cookies.get('token')?.value;
  
  // Check if the token is missing
  if (!token) {
    console.error("Missing token");
    return NextResponse.redirect(new URL('/login', request.url)); // Redirect to login page
  }

  // Retrieve the secret key for JWT verification from environment variables
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    console.error("Missing JWT_SECRET in environment variables");
    return NextResponse.redirect(new URL('/login', request.url)); // Redirect to login page if secret key is missing
  }

  try {
    // Verify the JWT and extract the payload
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secretKey));
    const user = payload.sub; // Extract user ID from the token payload

    // Check if the user ID exists in the payload
    if (!user) {
      console.error("User not found");
      return NextResponse.redirect(new URL('/login', request.url)); // Redirect to login if user is not found
    }

    // Retrieve the workspace associated with the request, if applicable
    const workspace = await getWorkspaceFromRequest(request);
    
    // Get the permissions for the user in the specified workspace
    const permissions = await getPermissions(user, workspace);

    // Determine the requested path and request method (e.g., GET, POST)
    const requestedPath = request.nextUrl.pathname;
    const requestMethod = request.method.toUpperCase();

    // Check the permissions required for the requested route
    const routePermissions = permissionsConfig[requestedPath]?.[requestMethod];

    // If route permissions are defined, check if the user has one of the required permissions
    let hasPermission = routePermissions.some(role => {
      const hasRole = permissions.includes(role);
      return hasRole;
    });
    
    if (!hasPermission) {
      return NextResponse.json(
        { message: 'Access denied: insufficient permissions.' },
        { status: 403 }
      );
    }

    return NextResponse.next(); // Allow access to the requested route if all checks pass
  } catch (err) {
    console.error(err); // Log any errors that occur during JWT verification or processing
    return NextResponse.redirect(new URL('/login', request.url)); // Redirect to login if an error occurs
  }
}

// Middleware configuration to protect routes starting with /api/protected
export const config = {
  matcher: ['/api/protected/:path*'], // Only apply this middleware to protected routes
};
