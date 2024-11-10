// app/api/protected/invitation/[id]/route.js
import { invitationFieldValidations, InvitationDTO } from '@/model/invitationModel';
import { GenericController } from '@/utils/api/GenericController';
import { handleRequest } from '@/utils/api/RequestUtils';
import prisma from '@/lib/prisma';

const invitationController = new GenericController(prisma.invitation, InvitationDTO, invitationFieldValidations);

export async function GET(request, { params }) {
    const chronosResponse = await invitationController.getById(request, params);
    return chronosResponse.generateNextResponse();
}

export async function PUT(request, { params }) {
    const body = await handleRequest(request);
    const chronosResponse = await invitationController.update(request, params, body);
    return chronosResponse.generateNextResponse();
}

export async function DELETE(request, { params }) {
    const chronosResponse = await invitationController.delete(request, params);
    return chronosResponse.generateNextResponse();
}