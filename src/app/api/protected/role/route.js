// app/api/protected/role/route.js
import { roleFieldValidations, RoleDTO } from '@/model/roleModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import prisma from '@/lib/prisma';

const roleController = new GenericController(prisma.role, RoleDTO, roleFieldValidations);

export async function GET(request) {
  const chronosResponse = await roleController.getAll();
  return chronosResponse.generateNextResponse();
}

export async function POST(request) {
  const chronosResponse = await roleController.create(request);
  return chronosResponse.generateNextResponse();
}