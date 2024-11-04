# For all stages, we will use the same base image
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

EXPOSE 3000

# development stage (ENV=development)
FROM base AS development
COPY . .

# We need the build stage for the production stage
FROM base AS build
COPY . .
RUN npm run build

# production stage (ENV=production)
FROM node:18-alpine AS production

COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public || true
COPY --from=build /app/next.config.js ./next.config.js || true