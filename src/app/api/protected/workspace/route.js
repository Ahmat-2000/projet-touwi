// app/api/protected/workspace/route.js
import { PrismaClient } from '@prisma/client';
import { workspaceFieldValidations, WorkspaceDTO } from '@/model/workspaceModel';
import { GenericController } from '@/utils/api/GeneriqueController';

const prisma = new PrismaClient();
const workspaceController = new GenericController(prisma.workspace, WorkspaceDTO, workspaceFieldValidations);


export async function GET(request) {
  return workspaceController.getAll();
}

export async function POST(request) {
  const body = await request.json();

  // Create a new path for the workspace
  body.path = "uuid_workspace"; // TODO : Generate a UUID for the workspace

  return workspaceController.create({ json: () => Promise.resolve(body) });
}
