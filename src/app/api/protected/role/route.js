// app/api/protected/role/route.js
import { PrismaClient } from '@prisma/client';
import { roleFieldValidations, RoleDTO } from '@/model/roleModel';
import { GenericController } from '@/utils/api/GeneriqueController';

const prisma = new PrismaClient();
const roleController = new GenericController(prisma.role, RoleDTO, roleFieldValidations);

export async function GET(request) {
  return roleController.getAll();
}

export async function POST(request) {
  return roleController.create(request);
}