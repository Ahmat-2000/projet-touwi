# For all stages, we will use the same base image
FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .


# development stage (ENV=development)
FROM base AS development

ENV PORT=3000

EXPOSE ${PORT}


# production stage (ENV=production)
FROM base AS production

RUN npm run build

ENV PORT=3000

EXPOSE ${PORT}
