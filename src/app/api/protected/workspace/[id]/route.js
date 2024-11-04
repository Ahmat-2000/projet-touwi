//api/protected/workspace/[id]/route.js
import { workspaceFieldValidations, WorkspaceDTO } from '@/model/workspaceModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import { deleteWorkspace } from '@/services/api/WorkspaceDiskService';
import prisma from '@/lib/prisma';

const workspaceController = new GenericController(prisma.workspace, WorkspaceDTO, workspaceFieldValidations);

export async function GET(request, { params }) {
    return workspaceController.getById(params);
}

export async function PUT(request, { params }) {
    return workspaceController.update(request, params);
}

export async function DELETE(request, { params }) {
    prisma.workspace.findUnique({ where: { id: params.id } }).then(workspace => {
        deleteWorkspace(workspace.path);
    });

    return workspaceController.delete(params);
}