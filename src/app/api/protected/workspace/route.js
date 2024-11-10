// app/api/protected/workspace/route.js
import { workspaceFieldValidations, WorkspaceDTO } from '@/model/workspaceModel';
import { GenericController } from '@/utils/api/GenericController';
import { createWorkspace } from '@/services/api/WorkspaceDiskService';
import { getUserFromRequest } from '@/services/api/UserService';
import { getRelatedWorkspaces } from '@/services/api/workspaceService';
import { handleRequest } from '@/utils/api/RequestUtils';
import prisma from '@/lib/prisma';

const workspaceController = new GenericController(prisma.workspace, WorkspaceDTO, workspaceFieldValidations);

export async function GET(request) {
  const chronosResponse = await workspaceController.getAll(request);

  const user = await getUserFromRequest(request);
  
  // Check if the user is an admin and return all invitations if true
  if (user.is_admin) return chronosResponse.generateNextResponse();

  // Retrieve workspaceIds accessible by the user
  const accessibleWorkspaceIds = await getRelatedWorkspaces(user);

  // Filter out invitations to workspaces the user does not have access
  chronosResponse.data = chronosResponse.data.filter(workspace => 
    accessibleWorkspaceIds.has(workspace.id)
  );

  return chronosResponse.generateNextResponse();
}

export async function POST(request) {
  const body = await handleRequest(request);

  const path = await createWorkspace();
  body.path = path;

  const chronosResponse = await workspaceController.create(request, body);

  if (!chronosResponse.isSuccessful()) {
    return chronosResponse.generateNextResponse();
  }

  // Retrieve the information for the userRole creation
  const user = await getUserFromRequest(request);
  const workspaceId = chronosResponse.data.id;
  const userId = user.id;

  // Create the userRole for the user who created the workspace
  const userRoleBody = {
    Workspace: { connect: { id: workspaceId } },
    User: { connect: { id: userId } },
    Role: { connect: { name: 'admin' } }, // TODO: Implement a method to get the default role at the creation of a workspace and the default role when inviting a user
  };
  await prisma.userRole.create({ data: userRoleBody });

  return chronosResponse.generateNextResponse();
}
