// app/api/protected/user/[id]/route.js
import { roleFieldValidations, RoleDTO } from '@/model/roleModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import prisma from '@/lib/prisma';

const roleController = new GenericController(prisma.role, RoleDTO, roleFieldValidations);

export async function GET(request, { params }) {
    return (await roleController.getById(params)).generateResponse();
}

export async function PUT(request, { params }) {
    return (await roleController.update(request, params)).generateResponse();
}

export async function DELETE(request, { params }) {
    return (await roleController.delete(params)).generateResponse();
}