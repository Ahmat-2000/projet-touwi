// app/api/protected/invitation/route.js
import { invitationFieldValidations, InvitationDTO } from '@/model/invitationModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import prisma from '@/lib/prisma';

const invitationController = new GenericController(prisma.invitation, InvitationDTO, invitationFieldValidations);

export async function GET(request) {
  return invitationController.getAll();
}

export async function POST(request) {
  return invitationController.create(request);
}