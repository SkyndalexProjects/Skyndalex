FROM node:24-alpine

RUN apk add --no-cache openssl

WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

CMD ["npm", "start"]
