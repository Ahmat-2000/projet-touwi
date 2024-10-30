// app/api/protected/invitation/route.js
import { PrismaClient } from '@prisma/client';
import { invitationFieldValidations, invitationDTO } from '@/model/invitationModel';
import { GenericController } from '@/services/api/GeneriqueController';

const prisma = new PrismaClient();
const invitationController = new GenericController(prisma.invitation, invitationDTO, invitationFieldValidations);


export async function GET(request) {
  return invitationController.getAll();
}

export async function POST(request) {
  return invitationController.create(request);
}