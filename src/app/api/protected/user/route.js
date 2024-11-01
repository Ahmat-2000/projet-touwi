// app/api/protected/user/route.js
import { PrismaClient } from '@prisma/client';
import { userFieldValidations, UserDTO } from '@/model/userModel';
import { GenericController } from '@/utils/api/GeneriqueController';

const prisma = new PrismaClient();
const userController = new GenericController(prisma.user, UserDTO, userFieldValidations);

export async function GET(request) {
  return userController.getAll();
}

export async function POST(request) {
  return userController.create(request);
}