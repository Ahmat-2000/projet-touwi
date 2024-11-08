#!/bin/sh

# Install dependencies
npm install

# Push the Prisma schema directly to the database
echo "Applying Prisma schema to the database..."
npx prisma db push  # This syncs the database with schema.prisma without creating migrations

# Generate Prisma Migration
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate



# Path for the flag file to prevent reseeding
SEED_FLAG_FILE="/app/.seeded"

# If the seed flag file doesn't exist, run the seed command
if [ ! -f "$SEED_FLAG_FILE" ]; then
  echo "Running database seeding..."
  npm run seed

  # Create the flag file to indicate seeding has been completed
  touch "$SEED_FLAG_FILE"
else
  echo "Database already seeded, skipping seeding."
fi


# Run environment-specific commands
if [ "$ENV" = "production" ]; then
  echo "Starting in production mode..."
  npm run start
elif [ "$ENV" = "development" ]; then
  echo "Starting in development mode..."
  npm run dev
else
  echo "Error: ENV variable not set correctly."
  exit 1
fi
