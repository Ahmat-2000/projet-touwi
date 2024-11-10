// app/api/protected/role/route.js
import { roleFieldValidations, RoleDTO } from '@/model/roleModel';
import { GenericController } from '@/utils/api/GenericController';
import prisma from '@/lib/prisma';

const roleController = new GenericController(prisma.role, RoleDTO, roleFieldValidations);

export async function GET(request) {
  const chronosResponse = await roleController.getAll(request);
  return chronosResponse.generateNextResponse();
}

export async function POST(request) {
  const body = await handleRequest(request);
  const chronosResponse = await roleController.create(request, body);
  return chronosResponse.generateNextResponse();
}