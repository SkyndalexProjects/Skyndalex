import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import fastifyFlash from "@fastify/flash";
import fastifyCors from "@fastify/cors";
import autoLoad from "@fastify/autoload";
import fastifyFormBody from "@fastify/formbody";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import type { SkyndalexClient } from "#classes";

declare module "fastify" {
	interface FastifyRequest {
		client: SkyndalexClient;
	}
}
// @ts-ignore
export class DashboardServer {
	app: Fastify.FastifyInstance;
	client: SkyndalexClient;

	constructor(client: SkyndalexClient) {
		this.client = client;
		this.app = Fastify({ logger: true });
	}

	async init() {
		const app = this.app;

		app.register(fastifyCookie);
		app.register(fastifySession, {
			secret: process.env.SESSION_SECRET || "defaultsecret",
			cookie: { secure: true, httpOnly: true },
		});
		app.register(fastifyFlash);
		app.register(fastifyCors, {
			origin: process.env.FRONTEND_URL,
			credentials: true,
		});
		app.addHook("preHandler", async (request: FastifyRequest) => {
			request.client = this.client;
		});

		app.addHook("preHandler", async (req, reply) => {
			const origin = req.headers.origin;
			if (origin === undefined || origin === process.env.FRONTEND_URL) {
				return;
			}
			reply.code(403).send({ error: "Forbidden" });
		});

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = dirname(__filename);

		app.register(autoLoad, {
			dir: path.join(__dirname, "../dashboard/routes"),
			routeParams: true,
		});

		app.register(fastifyFormBody);

		try {
			await app.listen({ port: Number(process.env.API_PORT) });
			app.log.info(`[server] listening on ${app.server.address()}`);
		} catch (err) {
			app.log.error(err);
		}

		app.ready(() => {
			console.log(app.printRoutes());
		});

		return app;
	}
}

export default DashboardServer;
