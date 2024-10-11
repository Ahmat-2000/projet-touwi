FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm install

FROM base AS dev

ENV NODE_ENV=development

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
