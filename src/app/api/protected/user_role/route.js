// app/api/protected/userRole/route.js
import { PrismaClient } from '@prisma/client';
import { userRoleFieldValidations, UserRoleDTO } from '@/model/userRoleModel';
import { GenericController } from '@/utils/api/GeneriqueController';

const prisma = new PrismaClient();
const userRoleController = new GenericController(prisma.userRole, UserRoleDTO, userRoleFieldValidations);

export async function GET(request) {
  return userRoleController.getAll();
}

export async function POST(request) {
  return userRoleController.create(request);
}