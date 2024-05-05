FROM node:20-alpine
WORKDIR /usr/src/app
COPY . .
RUN npx prisma generate
RUN npm install
CMD ["npm", "run", "dev"]