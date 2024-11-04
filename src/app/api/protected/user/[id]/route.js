// app/api/protected/user/[id]/route.js
import { PrismaClient } from '@prisma/client';
import { userFieldValidations, UserDTO } from '@/model/userModel';
import { GenericController } from '@/utils/api/GeneriqueController';

const prisma = new PrismaClient();
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