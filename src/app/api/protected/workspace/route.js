// app/api/protected/workspace/route.js
import { workspaceFieldValidations, WorkspaceDTO } from '@/model/workspaceModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import { createWorkspace } from '@/services/api/WorkspaceDiskService';
import { getUserFromRequest } from '@/services/api/UserService';
import { getRelatedWorkspaces } from '@/services/api/workspaceService';
import prisma from '@/lib/prisma';

const workspaceController = new GenericController(prisma.workspace, WorkspaceDTO, workspaceFieldValidations);

export async function GET(request) {
  const chronosResponse = await workspaceController.getAll();

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
  const body = await request.json();

  const path = await createWorkspace();
  body.path = path;

  const chronosResponse = await workspaceController.create({ json: () => Promise.resolve(body) });
  return chronosResponse.generateNextResponse();
}
