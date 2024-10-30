// app/api/protected/user/route.js
import { PrismaClient } from '@prisma/client';
import { userFieldValidations, userDTO } from '@/model/userModel';
import { GenericController } from '@/services/api/GeneriqueController';


const prisma = new PrismaClient();
const userController = new GenericController(prisma.user, userDTO, userFieldValidations);


export async function GET(request) {
  return userController.getAll();
}

export async function POST(request) {
  return userController.create(request);
}