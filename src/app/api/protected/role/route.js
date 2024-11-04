// app/api/protected/role/route.js
import { roleFieldValidations, RoleDTO } from '@/model/roleModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import prisma from '@/lib/prisma';

const roleController = new GenericController(prisma.role, RoleDTO, roleFieldValidations);

export async function GET(request) {
  return roleController.getAll();
}

export async function POST(request) {
  return roleController.create(request);
}