// app/api/protected/user/route.js
import { PrismaClient } from '@prisma/client';
import { userFieldValidations, UserDTO } from '@/model/userModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const userController = new GenericController(prisma.user, UserDTO, userFieldValidations);

export async function GET(request) {
  return userController.getAll();
}

export async function POST(request) {
  const body = await request.json();
  
  body.password = await bcrypt.hash(body.password, 10);

  return userController.create({ json: () => Promise.resolve(body) });
}