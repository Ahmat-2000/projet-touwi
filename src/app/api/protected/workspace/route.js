// app/api/protected/workspace/route.js
import { PrismaClient } from '@prisma/client';
import { workspaceFieldValidations, WorkspaceDTO } from '@/model/workspaceModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import { createWorkspace } from '@/services/api/WorkspaceDiskService';

const prisma = new PrismaClient();
const workspaceController = new GenericController(prisma.workspace, WorkspaceDTO, workspaceFieldValidations);


export async function GET(request) {
  return workspaceController.getAll();
}

export async function POST(request) {
  const body = await request.json();
  const path = await createWorkspace();
  body.path = path;
  return workspaceController.create({ json: () => Promise.resolve(body) });
}
