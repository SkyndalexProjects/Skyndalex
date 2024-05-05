FROM node:20-alpine
WORKDIR /src
COPY . .
RUN npx prisma generate
RUN npm install
CMD ["npm", "run", "dev"]
EXPOSE 3000