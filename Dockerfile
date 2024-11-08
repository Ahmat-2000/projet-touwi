# For all stages, we will use the same base image
FROM node:18-alpine AS base
WORKDIR /app
COPY . .
EXPOSE 3000

# development stage (ENV=development)
FROM base AS development
RUN npm install

# We need the build stage for the production stage
FROM base AS build
RUN npm run build

# production stage (ENV=production)
FROM node:18-alpine AS production
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=base /app/package.json ./

RUN npm install --only=production
