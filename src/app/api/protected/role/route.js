// app/api/protected/role/route.js
import { PrismaClient } from '@prisma/client';
import { roleFieldValidations, roleDTO } from '@/model/roleModel';
import { GenericController } from '@/services/api/GeneriqueController';

const prisma = new PrismaClient();
const roleController = new GenericController(prisma.role, roleDTO, roleFieldValidations);


export async function GET(request) {
  return roleController.getAll();
}

export async function POST(request) {
  return roleController.create(request);
}