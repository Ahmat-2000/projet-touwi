// app/api/protected/userRole/route.js
import { userRoleFieldValidations, UserRoleDTO } from '@/model/userRoleModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import prisma from '@/lib/prisma';

const userRoleController = new GenericController(prisma.userRole, UserRoleDTO, userRoleFieldValidations);

export async function GET(request) {
  const chronosResponse = await userRoleController.getAll();
  return chronosResponse.generateNextResponse();
}

export async function POST(request) {
  const chronosResponse = await userRoleController.create(request);
  return chronosResponse.generateNextResponse();
}