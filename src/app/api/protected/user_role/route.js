// app/api/protected/userRole/route.js
import { userRoleFieldValidations, UserRoleDTO } from '@/model/userRoleModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import { getUserFromRequest } from '@/services/api/UserService';
import { getRelatedWorkspaces } from '@/services/api/workspaceService';
import prisma from '@/lib/prisma';

const userRoleController = new GenericController(prisma.userRole, UserRoleDTO, userRoleFieldValidations);

export async function GET(request) {
  const chronosResponse = await userRoleController.getAll();
  
  const user = await getUserFromRequest(request);
  
  // Check if the user is an admin and return all invitations if true
  if (user.is_admin) return chronosResponse.generateNextResponse();

  // Retrieve workspaceIds accessible by the user
  const accessibleWorkspaceIds = await getRelatedWorkspaces(user);

  // Filter out invitations to workspaces the user does not have access
  chronosResponse.data = chronosResponse.data.filter(userRole => 
    accessibleWorkspaceIds.has(userRole.workspace_id)
  );

  return chronosResponse.generateNextResponse();
}

export async function POST(request) {
  const chronosResponse = await userRoleController.create(request);
  return chronosResponse.generateNextResponse();
}