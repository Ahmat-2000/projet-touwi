import { handleRequest } from "@/utils/api/RequestUtils";
import prisma from "@/lib/prisma";

/** 
 * Retrieve the workspace ID from the request URL by parsing the route or query parameters.
 * @param {Object} request - The request object.
 * @returns {Number} - The workspace ID.
 */
export async function getWorkspaceIdFromRequest(request) {
  const url = new URL(request.url);
  let workspaceId = null;

  // Identify the route
  const isWorkspaceRoute = url.pathname.startsWith('/api/protected/workspaces');

    // Extract the workspace ID from the URL either with the route or data send by the client
  if (isWorkspaceRoute) {
    const pathParts = url.pathname.split('/');
    workspaceId = pathParts[pathParts.length - 1];
  } else {
    const clonedRequest = request.clone();
    const jsonData = await handleRequest(clonedRequest);
    workspaceId = jsonData && jsonData.workspace_id;
  }

  const parsedWorkspaceId = parseInt(workspaceId, 10);

  // Return the parsed workspace ID or null if it's not a number
  return isNaN(parsedWorkspaceId) ? null : parsedWorkspaceId;
}

/**
 * Retrieve the workspace from the database using the workspace ID.
 * @param {Number} workspaceId - The workspace ID.
 * @returns {Object} - The workspace object.
 */
export async function getWorkspace(workspaceId) {
  
  if (!workspaceId) return null;

  // Retrieve the workspace from the database
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  return workspace || null;
}

/**
 * This function use the table userRole to retrieve the workspace IDs accessible by the user.
 * @param {Number} user - The user ID.
 * @returns {Set} - Set of workspace IDs.
 */
export async function getRelatedWorkspaces(user) {

  // Retrieve the workspace IDs accessible by the user using a select for performance
  const userWorkspaceIds = await prisma.userRole.findMany({
    where: { user_id: user.id },
    select: { workspace_id: true },
  });

  // Create a set of accessible workspace IDs for quick lookups
  const accessibleWorkspaceIds = new Set(userWorkspaceIds.map(userRole => userRole.workspace_id));

  return accessibleWorkspaceIds;
}