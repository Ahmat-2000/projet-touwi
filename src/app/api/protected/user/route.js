// app/api/protected/user/route.js
import { userFieldValidations, UserDTO } from '@/model/userModel';
import { GenericController } from '@/utils/api/GenericController';
import { handleRequest } from '@/utils/api/RequestUtils';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

const userController = new GenericController(prisma.user, UserDTO, userFieldValidations);

export async function GET(request) {
  const chronosResponse = await userController.getAll(request);
  return chronosResponse.generateNextResponse();
}

export async function POST(request) {
  const body = await handleRequest(request);
  
  body.password = await bcrypt.hash(body.password, 10);

  const chronosResponse = await userController.create(request, body);
  return chronosResponse.generateNextResponse();
}