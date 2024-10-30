// app/api/protected/workspace/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createWorkspace } from '@/services/api/WorkspaceDiskService';

const prisma = new PrismaClient();

// Fonction GET pour récupérer tous les espaces de travail
export async function GET() {
  try {
    const workspaces = await prisma.workspace.findMany();
    return NextResponse.json(workspaces, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Erreur lors de la récupération des espaces de travail.' }, { status: 500 });
  }
}

// Fonction POST pour créer un nouvel espace de travail
export async function POST(request) {
  try {
    const { name } = await request.json();
    const workspacePath = await createWorkspace();


    // Créer un nouvel espace de travail
    await prisma.workspace.create({
      data: {
        name,
        path: workspacePath,
      }
    });
    return NextResponse.json({ message: 'Espace de travail créé avec succès.' }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Erreur lors de la création de l\'espace de travail.' }, { status: 500 });
  }

}


