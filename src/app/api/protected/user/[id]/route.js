// app/api/protected/user/[id]/route.js
import { userFieldValidations, UserDTO } from '@/model/userModel';
import { GenericController } from '@/utils/api/GenericController';
import { handleRequest } from '@/utils/api/RequestUtils';
import prisma from '@/lib/prisma';

const userController = new GenericController(prisma.user, UserDTO, userFieldValidations);

export async function GET(request, { params }) {
    const chronosResponse = await userController.getById(request, params);
    return chronosResponse.generateNextResponse();
}

export async function PUT(request, { params }) {
    const body = await handleRequest(request);
    const chronosResponse = await userController.update(request, params, body);
    return chronosResponse.generateNextResponse();
}

export async function DELETE(request, { params }) {
    const chronosResponse = await userController.delete(request, params);
    return chronosResponse.generateNextResponse();
}