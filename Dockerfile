FROM --platform=$TARGETOS/$TARGETARCH node:20-bullseye-slim
WORKDIR /src
COPY . .
RUN npx prisma generate
RUN npm install
CMD ["npm", "run", "dev"]