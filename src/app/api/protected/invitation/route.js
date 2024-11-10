// app/api/protected/invitation/route.js
import { invitationFieldValidations, InvitationDTO } from '@/model/invitationModel';
import { GenericController } from '@/utils/api/GenericController';
import { getUserFromRequest } from '@/services/api/UserService';
import { getRelatedWorkspaces } from '@/services/api/WorkspaceService';
import { handleRequest } from '@/utils/api/RequestUtils';
import prisma from '@/lib/prisma';

const invitationController = new GenericController(prisma.invitation, InvitationDTO, invitationFieldValidations);

export async function GET(request) {
  const chronosResponse = await invitationController.getAll(request);

  const user = await getUserFromRequest(request);
  
  // Check if the user is an admin and return all invitations if true
  if (user.is_admin) return chronosResponse.generateNextResponse();

  // Retrieve workspaceIds accessible by the user
  const accessibleWorkspaceIds = await getRelatedWorkspaces(user);

  // Filter out invitations to workspaces the user does not have access
  chronosResponse.data = chronosResponse.data.filter(invitation => 
    accessibleWorkspaceIds.has(invitation.workspace_id)
  );

  return chronosResponse.generateNextResponse();
}


export async function POST(request) {
  const body = await handleRequest(request);

  // Retrieve the user from the request
  const user = await getUserFromRequest(request);
  const ownerId = user.id;

  // Add the owner_id to the body
  body.owner_id = ownerId;

  // Create the invitation
  const chronosResponse = await invitationController.create(request, body);
  return chronosResponse.generateNextResponse();
}