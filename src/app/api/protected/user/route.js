// app/api/protected/user/route.js
import { userFieldValidations, UserDTO } from '@/model/userModel';
import { GenericController } from '@/utils/api/GeneriqueController';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

const userController = new GenericController(prisma.user, UserDTO, userFieldValidations);

export async function GET(request) {
  return userController.getAll();
}

export async function POST(request) {
  const body = await request.json();
  
  body.password = await bcrypt.hash(body.password, 10);

  return userController.create({ json: () => Promise.resolve(body) });
}