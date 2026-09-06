# Running example

```
npm install
npm run build
npm run start
```

# Running on Docker

## From Stable

```
sudo docker build --tag skyndalex:stable .
sudo docker compose up
```

## From Preview

```
sudo docker build --tag skyndalex:preview .
sudo docker compose -f docker-compose:preview.yml up
```

# Containers

- Lavalink

`docker run -d --name lavalink -p 2333:2333 -e SERVER_PORT=2333 -e LAVALINK_SERVER_PASSWORD=yourserverpassword ghcr.io/lavalink-devs/lavalink:4-alpine`

- Redis

`docker run -d --name redis -p 2136:6379 redis:latest`
## Links

- [skyndalex.com](https://skyndalex.com)
- [docs](https://docs.skyndalex.com)
- [support](https://discord.gg/SqPUr5R7YF)
