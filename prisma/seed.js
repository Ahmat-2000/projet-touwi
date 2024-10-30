const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

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

      // Traitement spécifique pour la table des utilisateurs
      if (tableName === 'user') {
        // Chiffrer les mots de passe
        const usersWithHashedPasswords = await Promise.all(
          data.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10); // Chiffrement du mot de passe
            return {
              ...user,
              password: hashedPassword, // Remplacer le mot de passe par le mot de passe chiffré
            };
          })
        );

        // Utilisation dynamique de Prisma pour ajouter les données
        await prisma[tableName].createMany({
          data: usersWithHashedPasswords,
          skipDuplicates: true,
        });

        console.log(`Données ajoutées pour la table: ${tableName}`);
      } else {
        // Pour les autres tables, on les insère sans modification
        await prisma[tableName].createMany({
          data,
          skipDuplicates: true,
        });

        console.log(`Données ajoutées pour la table: ${tableName}`);
      }
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
