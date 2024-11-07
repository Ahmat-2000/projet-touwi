//api/protected/workspace/[id]/route.js
import { workspaceFieldValidations, WorkspaceDTO } from '@/model/workspaceModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import { deleteWorkspace } from '@/services/api/WorkspaceDiskService';
import prisma from '@/lib/prisma';

const workspaceController = new GenericController(prisma.workspace, WorkspaceDTO, workspaceFieldValidations);

export async function GET(request, { params }) {
    return (await workspaceController.getById(params)).generateResponse();
}

export async function PUT(request, { params }) {
    return (await workspaceController.update(request, params)).generateResponse();
}

export async function DELETE(request, { params }) {
    const result = workspaceController.delete(params);

    console.log(result);

    if (!(await result).isSuccessful()) {
        return result;
    }

    // Delete the workspace folder and all the users roles and invitations related to it
    const body = (await result).getData();

    deleteWorkspace(body.path);
    prisma.userRole.deleteMany({ where: { workspace_id: params.id } });
    prisma.invitation.deleteMany({ where: { workspace_id: params.id } });

    return (await result).generateResponse();
}