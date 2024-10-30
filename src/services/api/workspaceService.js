import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Récupère le workspace associé à la requête.
 * @param {Request} request - La requête HTTP.
 * @returns {Promise<Object|null>} - Le workspace ou null si non trouvé ou non spécifié.
 */
export async function getWorkspaceFromRequest(request) {
  const url = new URL(request.url);
  let workspaceId = null;

  // Identifier si la route est spécifique à un workspace
  const isWorkspaceRoute = url.pathname.startsWith('/api/protected/workspaces');

  if (isWorkspaceRoute) {
    // Extraire l'ID depuis l'URL (ex : /api/protected/workspaces/:id)
    const pathParts = url.pathname.split('/');
    workspaceId = pathParts[pathParts.length - 1];
  } else {
    // Sinon, extraire depuis les paramètres de requête
    workspaceId = url.searchParams.get('workspaceId');
  }

  // Convertir l'ID en entier et vérifier sa validité
  const parsedWorkspaceId = parseInt(workspaceId, 10);
  if (isNaN(parsedWorkspaceId)) {
    return null; // Retourner null si l'ID est invalide
  }

  // Récupérer le workspace correspondant à l'ID dans la base de données
  const workspace = await prisma.workspace.findUnique({
    where: { id: parsedWorkspaceId },
  });

  return workspace || null; // Retourne le workspace ou null s'il n'existe pas
}
