// app/api/protected/invitation/[id]/route.js
import prisma from '@/lib/prisma';
import { invitationFieldValidations, InvitationDTO } from '@/model/invitationModel';
import { GenericController } from '@/utils/api/GeneriqueController';

const invitationController = new GenericController(prisma.invitation, InvitationDTO, invitationFieldValidations);

export async function GET(request, { params }) {
    return (await invitationController.getById(params)).generateResponse();
}

export async function PUT(request, { params }) {
    return (await invitationController.update(request, params)).generateResponse();
}

export async function DELETE(request, { params }) {
    return (await invitationController.delete(params)).generateResponse();
}