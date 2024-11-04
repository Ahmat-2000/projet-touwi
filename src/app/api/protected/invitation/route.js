// app/api/protected/invitation/route.js
import { PrismaClient } from '@prisma/client';
import { invitationFieldValidations, InvitationDTO } from '@/model/invitationModel';
import { GenericController } from '@/utils/api/GeneriqueController';

const prisma = new PrismaClient();
const invitationController = new GenericController(prisma.invitation, InvitationDTO, invitationFieldValidations);

export async function GET(request) {
  return invitationController.getAll();
}

export async function POST(request) {
  return invitationController.create(request);
}