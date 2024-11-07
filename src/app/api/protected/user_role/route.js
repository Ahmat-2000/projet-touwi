// app/api/protected/userRole/route.js
import { userRoleFieldValidations, UserRoleDTO } from '@/model/userRoleModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import prisma from '@/lib/prisma';

const userRoleController = new GenericController(prisma.userRole, UserRoleDTO, userRoleFieldValidations);

export async function GET(request) {
  return (await userRoleController.getAll()).generateResponse();
}

export async function POST(request) {
  return (await userRoleController.create(request)).generateResponse();
}