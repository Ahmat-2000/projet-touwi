// app/api/protected/user/[id]/route.js
import { roleFieldValidations, RoleDTO } from '@/model/roleModel';
import { GenericController } from '@/utils/api/GenericController';
import { handleRequest } from '@/utils/api/RequestUtils';
import prisma from '@/lib/prisma';

const roleController = new GenericController(prisma.role, RoleDTO, roleFieldValidations);

export async function GET(request, { params }) {
    const chronosResponse = await roleController.getById(request, params);
    return chronosResponse.generateNextResponse();
}

export async function PUT(request, { params }) {
    const body = await handleRequest(request);
    const chronosResponse = await roleController.update(request, params, body);
    return chronosResponse.generateNextResponse();
}

export async function DELETE(request, { params }) {
    const chronosResponse = await roleController.delete(request, params);
    return chronosResponse.generateNextResponse();
}