// app/api/protected/invitation/[id]/route.js
import prisma from '@/lib/prisma';
import { invitationFieldValidations, InvitationDTO } from '@/model/invitationModel';
import { GenericController } from '@/utils/api/GeneriqueController';

const invitationController = new GenericController(prisma.invitation, InvitationDTO, invitationFieldValidations);

export async function GET(request, { params }) {
    return invitationController.getById(params);
}

export async function PUT(request, { params }) {
    return invitationController.update(request, params);
}

export async function DELETE(request, { params }) {
    return invitationController.delete(params);
}