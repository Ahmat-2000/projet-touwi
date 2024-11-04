// app/api/protected/user/[id]/route.js
import { userFieldValidations, UserDTO } from '@/model/userModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import prisma from '@/lib/prisma';

const userController = new GenericController(prisma.user, UserDTO, userFieldValidations);

export async function GET(request, { params }) {
    return userController.getById(params);
}

export async function PUT(request, { params }) {
    return userController.update(request, params);
}

export async function DELETE(request, { params }) {
    return userController.delete(params);
}