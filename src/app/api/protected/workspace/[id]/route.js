//api/protected/workspace/[id]/route.js
import { PrismaClient } from '@prisma/client';
import { workspaceFieldValidations, WorkspaceDTO } from '@/model/workspaceModel';
import { GenericController } from '@/utils/api/GeneriqueController';

const prisma = new PrismaClient();
const workspaceController = new GenericController(prisma.workspace, WorkspaceDTO, workspaceFieldValidations);

export async function GET(request, { params }) {
    return workspaceController.getById(params);
}

export async function PUT(request, { params }) {
    return workspaceController.update(request, params);
}

export async function DELETE(request, { params }) {
    return workspaceController.delete(params);
}