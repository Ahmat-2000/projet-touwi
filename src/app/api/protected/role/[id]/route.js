// app/api/protected/user/[id]/route.js
import { PrismaClient } from '@prisma/client';
import { roleFieldValidations, roleDTO } from '@/model/roleModel';
import { GenericController } from '@/services/api/GeneriqueController';

const prisma = new PrismaClient();
const roleController = new GenericController(prisma.role, roleDTO, roleFieldValidations);

export async function GET(request, { params }) {
    return roleController.getById(params);
}

export async function PUT(request, { params }) {
    return roleController.update(request, params);
}

export async function DELETE(request, { params }) {
    return roleController.delete(params);
}