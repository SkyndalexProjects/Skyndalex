import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import fastifyFlash from "@fastify/flash";
import fastifyCors from "@fastify/cors";
import autoLoad from "@fastify/autoload";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import { SkyndalexClient } from "#classes";
import { FastifyRequest } from "fastify";

const fastify = Fastify();

declare module "fastify" {
	interface FastifyRequest {
		client: SkyndalexClient;
	}
}

export async function InitServer(client: SkyndalexClient) {
	fastify.register(fastifyCookie);
	fastify.register(fastifySession, {
		secret: process.env.SESSION_SECRET,
		cookie: { secure: false, httpOnly: false },
	});
	fastify.register(fastifyFlash);
	fastify.register(fastifyCors, {
		origin: "http://localhost:5173",
		credentials: true,
	});
	fastify.addHook(
		"preHandler",
		async (request: FastifyRequest & { client: SkyndalexClient }) => {
			request.client = client;
		},
	);

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);

	fastify.register(autoLoad, {
		dir: path.join(__dirname, "routes"),
		routeParams: true,
	});
	try {
		await fastify.listen({ port: 3000 });
		fastify.log.info(`[server] listening on ${fastify.server.address()}`);
	} catch (err) {
		fastify.log.error(err);
	}

	console.log("routes", fastify.printRoutes());

	return fastify;
}
