FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
# RUN ls -la /usr/src/app
# RUN ls -la /usr/src/app/src
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

CMD ["npm", "start"]
