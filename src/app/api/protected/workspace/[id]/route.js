//api/protected/workspace/[id]/route.js
import { workspaceFieldValidations, WorkspaceDTO } from '@/model/workspaceModel';
import { GenericController } from '@/utils/api/GenericController';
import { deleteWorkspace } from '@/services/api/WorkspaceDiskService';
import { handleRequest } from '@/utils/api/RequestUtils';
import prisma from '@/lib/prisma';

const workspaceController = new GenericController(prisma.workspace, WorkspaceDTO, workspaceFieldValidations);

export async function GET(request, { params }) {
    const chronosResponse = await workspaceController.getById(request, params);
    return chronosResponse.generateNextResponse();
}

export async function PUT(request, { params }) {
    const body = await handleRequest(request);
    const chronosResponse = await workspaceController.update(request, params, body);
    return chronosResponse.generateNextResponse();
}

export async function DELETE(request, { params }) {
    const chronosResponse = await workspaceController.delete(request, params);

    if (!chronosResponse.isSuccessful()) {
        return chronosResponse.generateNextResponse();
    }

    // Delete the workspace folder and all the users roles and invitations related to it
    const body =chronosResponse.data;

    deleteWorkspace(body.path);
    prisma.userRole.deleteMany({ where: { workspace_id: params.id } });
    prisma.invitation.deleteMany({ where: { workspace_id: params.id } });

    return chronosResponse.generateNextResponse();
}