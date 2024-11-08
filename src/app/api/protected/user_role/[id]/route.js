// app/api/protected/user_role/[id]/route.js
import { userRoleFieldValidations, UserRoleDTO } from '@/model/userRoleModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import prisma from '@/lib/prisma';

const userRoleController = new GenericController(prisma.userRole, UserRoleDTO, userRoleFieldValidations);

export async function GET(request, { params }) {
    const chronosResponse = await userRoleController.getById(params);
    return chronosResponse.generateNextResponse();
}

export async function PUT(request, { params }) {
    const chronosResponse = await userRoleController.update(request, params);
    return chronosResponse.generateNextResponse();
}

export async function DELETE(request, { params }) {
    const chronosResponse = await userRoleController.delete(params);
    return chronosResponse.generateNextResponse();
}