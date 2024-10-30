import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';
import { getWorkspaceFromRequest } from '@/services/api/workspaceService';
import { getPermissions } from '@/services/api/permissionService';
import permissionsConfig from '@/app/api/permissionsConfig'; // Importation de la configuration des permissions

const prisma = new PrismaClient();

/**
 * Middleware de protection des routes API avec vérification des permissions utilisateur.
 * @param {Request} request - La requête HTTP.
 * @returns {Promise<Response|void>} - Réponse redirigeant vers la connexion ou l'accès à la route demandée.
 */
export async function middleware(request) {
  // Récupère le token JWT depuis les cookies
  const token = request.cookies.get('token')?.value;
  console.log("Token:", token);
  
  if (!token) {
    console.error("Token manquant");
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    console.error("Clé JWT_SECRET manquante dans les variables d'environnement");
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secretKey));

    const user = payload.sub;

    console.log("Utilisateur:", user);

    if (!user) {
      console.error("Utilisateur non trouvé");
      // Rediriger si l'utilisateur n'est pas trouvé
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Récupérer le workspace lié à la requête (si disponible)
    const workspace = await getWorkspaceFromRequest(request);

    // Récupérer les permissions de l'utilisateur pour ce workspace
    const permissions = await getPermissions(user, workspace);

    // Déterminer la méthode de la requête et le chemin
    const requestedPath = request.nextUrl.pathname;
    const requestMethod = request.method.toUpperCase(); // Récupère la méthode de la requête (GET, POST, etc.)

    // Vérification des permissions pour la route demandée
    const routePermissions = permissionsConfig[requestedPath]?.[requestMethod];

    // Si des permissions sont définies pour la route, vérifier si l'utilisateur a l'une des permissions requises
    if (routePermissions && !routePermissions.some(role => permissions.includes(role))) {
      return NextResponse.json(
        { message: 'Accès interdit : permission insuffisante.' },
        { status: 403 }
      );
    }

    // Autoriser l'accès à la route si toutes les vérifications sont réussies
    return NextResponse.next();

  } catch (err) {
    console.error(err);
    // Redirige vers la page de connexion si le token est invalide ou en cas d'erreur
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configuration du middleware pour protéger les routes commençant par /api/protected
export const config = {
  matcher: ['/api/protected/:path*'],
};
