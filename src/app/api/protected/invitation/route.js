// app/api/protected/invitation/route.js
import { invitationFieldValidations, InvitationDTO } from '@/model/invitationModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import prisma from '@/lib/prisma';

const invitationController = new GenericController(prisma.invitation, InvitationDTO, invitationFieldValidations);

export async function GET(request) {
  return (await invitationController.getAll()).generateResponse();
}

export async function POST(request) {
  return (await invitationController.create(request)).generateResponse();
}