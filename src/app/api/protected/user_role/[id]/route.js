// app/api/protected/user_role/[id]/route.js
import { PrismaClient } from '@prisma/client';
import { userRoleFieldValidations, UserRoleDTO } from '@/model/userRoleModel';
import { GenericController } from '@/utils/api/GeneriqueController';

const prisma = new PrismaClient();
const userRoleController = new GenericController(prisma.userRole, UserRoleDTO, userRoleFieldValidations);

export async function GET(request, { params }) {
    return userRoleController.getById(params);
}

export async function PUT(request, { params }) {
    return userRoleController.update(request, params);
}

export async function DELETE(request, { params }) {
    return userRoleController.delete(params);
}