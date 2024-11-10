const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Function for seeding the database
async function seedDatabase() {
  const isDevelopment = process.env.ENV === 'development';
  const featuresDir = path.join(__dirname, 'seeds');

  console.log(`-----------------------------------------`);
  console.log(`Seeding the database with ${isDevelopment ? 'development' : 'production'} data...\n`);
  try {
    const files = fs.readdirSync(featuresDir);

    for (const file of files) {
      // We use the file extension to determine if we should seed the database with development or production data
      if ((isDevelopment && file.endsWith('.dev.json')) || (!isDevelopment && file.endsWith('.prod.json'))) {
        const filePath = path.join(featuresDir, file);
        const tableName = file.endsWith('.dev.json') ? path.basename(file, '.dev.json') : path.basename(file, '.prod.json');
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Encrypt the passwords for the user table
        if (tableName === 'user') {
          const usersWithHashedPasswords = await Promise.all(
            data.map(async (user) => {
              const hashedPassword = await bcrypt.hash(user.password, 10); // Encrypt the password
              return {
                ...user,
                password: hashedPassword, // Replace the password with the hashed password
              };
            })
          );

          await prisma[tableName].createMany({
            data: usersWithHashedPasswords,
            skipDuplicates: true,
          });
        } 
        // For other tables, we can insert the data as is
        else {
          await prisma[tableName].createMany({
            data,
            skipDuplicates: true,
          });
        }
        console.log(`Data successfully seeded for the ${tableName} table.`);
      }
    }
    console.log('\nDatabase seeding completed.');
    console.log(`-----------------------------------------\n`);
  } catch (error) {
    console.error("Error while seeding the database: ", error);
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