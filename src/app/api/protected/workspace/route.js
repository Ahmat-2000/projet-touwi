// app/api/protected/workspace/route.js
import { PrismaClient } from '@prisma/client';
import { workspaceFieldValidations, workspaceDTO } from '@/model/workspaceModel';
import { GenericController } from '@/services/api/GeneriqueController';


const prisma = new PrismaClient();
const workspaceController = new GenericController(prisma.workspace, workspaceDTO, workspaceFieldValidations);


export async function GET(request) {
  return workspaceController.getAll();
}

export async function POST(request) {
  return workspaceController.create(request);
}