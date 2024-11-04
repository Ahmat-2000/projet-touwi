// lib/prisma.js
import { PrismaClient } from '@prisma/client';

let prisma;

// Crée une instance unique de Prisma en mode production
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // En mode développement, attache Prisma au global pour éviter de recréer l'instance à chaque rafraîchissement
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
