// app/api/protected/workspace/route.js
import { workspaceFieldValidations, WorkspaceDTO } from '@/model/workspaceModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import { createWorkspace } from '@/services/api/WorkspaceDiskService';
import prisma from '@/lib/prisma';

const workspaceController = new GenericController(prisma.workspace, WorkspaceDTO, workspaceFieldValidations);


export async function GET(request) {
  const chronosResponse = await workspaceController.getAll();
  return chronosResponse.generateNextResponse();
}

export async function POST(request) {
  const body = await request.json();

  const path = await createWorkspace();
  body.path = path;

  const chronosResponse = await workspaceController.create({ json: () => Promise.resolve(body) });
  return chronosResponse.generateNextResponse();
}
