import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fastifyFlash from '@fastify/flash';
import fastifyCors from '@fastify/cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs';
import { SkyndalexClient } from '#classes';
import { FastifyRequest } from 'fastify';

const fastify = Fastify({ logger: true });

export async function InitServer(client: SkyndalexClient) {
    fastify.register(fastifyCookie);
    
	fastify.register(fastifySession, { 
        secret: process.env.SESSION_SECRET, 
        cookie: { secure: false, httpOnly: false } 
    });

    fastify.register(fastifyFlash);
    
	fastify.register(fastifyCors, {
        origin: "http://localhost:5173",
        credentials: true,
    });
	
    fastify.addHook("preHandler", async (request: FastifyRequest & { client: SkyndalexClient }) => {
        request.client = client;
    });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    await loadRoutes(path.join(__dirname, "routes"), "/");

    try {
        await fastify.listen({ port: 3000 });
        fastify.log.info(`[server] listening on ${fastify.server.address()}`);
    } catch (err) {
        fastify.log.error(err);
    }
    return fastify;
}

async function loadRoutes(
    dir: string,
    basePath: string = "",
): Promise<string[]> {
    const files = fs.readdirSync(dir);
    const routes: string[] = [];

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            const subRoutes = await loadRoutes(fullPath, `${basePath}${file}/`);
            routes.push(...subRoutes);
        } else if (file.endsWith(".js") || file.endsWith(".ts")) {
            const cleanRoute = file.split(".")[0];
            const routePath =
                cleanRoute === "index" ? basePath : `${basePath}${cleanRoute}`;
            const route = (await import(fullPath)).default;

            console.log("routePath", routePath);
			fastify.register(route, { prefix: routePath });
            routes.push(routePath);
        }
    }
    return routes;
}