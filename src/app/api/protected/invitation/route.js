// app/api/protected/invitation/route.js
import { invitationFieldValidations, InvitationDTO } from '@/model/invitationModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import { getUserFromRequest } from '@/services/api/UserService';
import { getRelatedWorkspaces } from '@/services/api/workspaceService';
import prisma from '@/lib/prisma';

const invitationController = new GenericController(prisma.invitation, InvitationDTO, invitationFieldValidations);

export async function GET(request) {
  console.log("Test GET 1");
  const chronosResponse = await invitationController.getAll();
  
  console.log("Test GET 1,5");
  
  const user = await getUserFromRequest(request);

  console.log("Test GET 2");
  
  // Check if the user is an admin and return all invitations if true
  if (user.is_admin) return chronosResponse.generateNextResponse();

  console.log("Test GET 3");

  // Retrieve workspaceIds accessible by the user
  const accessibleWorkspaceIds = await getRelatedWorkspaces(user);

  console.log("Test GET 4");

  // Filter out invitations to workspaces the user does not have access
  chronosResponse.data = chronosResponse.data.filter(invitation => 
    accessibleWorkspaceIds.has(invitation.workspace_id)
  );

  console.log("Test GET 5");

  return chronosResponse.generateNextResponse();
}


export async function POST(request) {
  const chronosResponse = await invitationController.create(request);
  return chronosResponse.generateNextResponse();
}