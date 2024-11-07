// app/api/protected/role/route.js
import { roleFieldValidations, RoleDTO } from '@/model/roleModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import prisma from '@/lib/prisma';

const roleController = new GenericController(prisma.role, RoleDTO, roleFieldValidations);

export async function GET(request) {
  return (await roleController.getAll()).generateResponse();
}

export async function POST(request) {
  return (await roleController.create(request)).generateResponse();
}