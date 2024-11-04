// app/api/protected/userRole/route.js
import { userRoleFieldValidations, UserRoleDTO } from '@/model/userRoleModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import prisma from '@/lib/prisma';

const userRoleController = new GenericController(prisma.userRole, UserRoleDTO, userRoleFieldValidations);

export async function GET(request) {
  return userRoleController.getAll();
}

export async function POST(request) {
  return userRoleController.create(request);
}