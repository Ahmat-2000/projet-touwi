// app/api/protected/invitation/[id]/route.js
import { PrismaClient } from '@prisma/client';
import { invitationFieldValidations, invitationDTO } from '@/model/invitationModel';
import { GenericController } from '@/services/api/GeneriqueController';

const prisma = new PrismaClient();
const invitationController = new GenericController(prisma.invitation, invitationDTO, invitationFieldValidations);

export async function GET(request, { params }) {
    return invitationController.getById(params);
}

export async function PUT(request, { params }) {
    return invitationController.update(request, params);
}


export async function DELETE(request, { params }) {
    return invitationController.delete(params);
}