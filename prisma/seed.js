const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedDatabase() {
  const featuresDir = path.join(__dirname, 'seeds');

  try {
    // Récupère tous les fichiers du dossier features
    const files = fs.readdirSync(featuresDir);

    for (const file of files) {
      const filePath = path.join(featuresDir, file);
      const tableName = path.basename(file, path.extname(file));
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      console.log(`Ajout des données pour la table: ${tableName}`);

      console.log('data : ', data);

      // Utilisation dynamique de Prisma pour ajouter les données
      await prisma[tableName].createMany({
        data,
        skipDuplicates: true,
      });

      console.log(`Données ajoutées pour la table: ${tableName}`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
