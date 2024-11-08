// app/api/protected/user/[id]/route.js
import { userFieldValidations, UserDTO } from '@/model/userModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import prisma from '@/lib/prisma';

const userController = new GenericController(prisma.user, UserDTO, userFieldValidations);

export async function GET(request, { params }) {
    const chronosResponse = await userController.getById(params);
    return chronosResponse.generateNextResponse();
}

export async function PUT(request, { params }) {
    const chronosResponse = await userController.update(request, params);
    return chronosResponse.generateNextResponse();
}

export async function DELETE(request, { params }) {
    const chronosResponse = await userController.delete(params);
    return chronosResponse.generateNextResponse();
}