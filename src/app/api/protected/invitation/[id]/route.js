// app/api/protected/invitation/[id]/route.js
import prisma from '@/lib/prisma';
import { invitationFieldValidations, InvitationDTO } from '@/model/invitationModel';
import { GenericController } from '@/utils/api/GeneriqueController';

const invitationController = new GenericController(prisma.invitation, InvitationDTO, invitationFieldValidations);

export async function GET(request, { params }) {
    const chronosResponse = await invitationController.getById(params);
    return chronosResponse.generateNextResponse();
}

export async function PUT(request, { params }) {
    const chronosResponse = await invitationController.update(request, params);
    return chronosResponse.generateNextResponse();
}

export async function DELETE(request, { params }) {
    const chronosResponse = await invitationController.delete(params);
    return chronosResponse.generateNextResponse();
}