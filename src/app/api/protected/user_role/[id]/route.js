// app/api/protected/user_role/[id]/route.js
import { userRoleFieldValidations, UserRoleDTO } from '@/model/userRoleModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import prisma from '@/lib/prisma';

const userRoleController = new GenericController(prisma.userRole, UserRoleDTO, userRoleFieldValidations);

export async function GET(request, { params }) {
    return (await userRoleController.getById(params)).generateResponse();
}

export async function PUT(request, { params }) {
    return (await userRoleController.update(request, params)).generateResponse();
}

export async function DELETE(request, { params }) {
    return (await userRoleController.delete(params)).generateResponse();
}