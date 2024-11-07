// app/api/protected/user/[id]/route.js
import { userFieldValidations, UserDTO } from '@/model/userModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import prisma from '@/lib/prisma';

const userController = new GenericController(prisma.user, UserDTO, userFieldValidations);

export async function GET(request, { params }) {
    return (await userController.getById(params)).generateResponse();
}

export async function PUT(request, { params }) {
    return (await userController.update(request, params)).generateResponse();
}

export async function DELETE(request, { params }) {
    return (await userController.delete(params)).generateResponse();
}