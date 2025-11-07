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
import { auth } from "./auth.js";
declare module "fastify" {
	interface FastifyRequest {
		client: SkyndalexClient;
		user?: { id: string };
	}
}
export class DashboardServer {
	app: Fastify.FastifyInstance;
	client: SkyndalexClient;

	constructor(client: SkyndalexClient) {
		this.client = client;
		this.app = Fastify({ logger: true });
	}

	async init() {
		const app = this.app;
        app.register(fastifyCors, {
            origin: [
                process.env.FRONTEND_URL,
                'https://beta.skyndalex.com',
                'https://skyndalex.com',
                'https://api.skyndalex.com'
            ] as string[],
            credentials: true,
            allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        });

		app.register(fastifyCookie);
        app.register(fastifySession, {
            secret: process.env.SESSION_SECRET as string,
            cookie: {
                secure: process.env.PRODUCTION === "true",
                httpOnly: true,
                sameSite: (process.env.PRODUCTION === "true" ? "none" : "lax") as "none" | "lax",
                domain: process.env.PRODUCTION === "true" ? (process.env.SESSION_COOKIE_DOMAIN || undefined) : undefined,
                path: "/",
                maxAge: Number(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000,
            },
        });
		app.register(import("@fastify/rate-limit"), {
			max: 100,
			timeWindow: "1 minute",
		});

		app.register(fastifyFlash);
		app.addHook("preHandler", async (request: FastifyRequest) => {
			request.client = this.client;
		});
        app.addHook("preHandler", async (req, reply) => {
            if (req.method === "OPTIONS") return;
            const origin = req.headers.origin;
            const allowedOrigins = [
                process.env.FRONTEND_URL,
                'https://beta.skyndalex.com',
                'https://skyndalex.com',
                'https://api.skyndalex.com'
            ];

            if (origin && !allowedOrigins.includes(origin)) {
                app.log.warn(`Blocked origin: ${origin}`);
                return reply.code(403).send({ error: "Forbidden" });
            }
        });
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = dirname(__filename);

        app.register(autoLoad, {
            dir: path.join(__dirname, "../dashboard/routes"),
            routeParams: true,
        });

		app.register(fastifyFormBody);

        app.all("/auth/*", async (request: FastifyRequest, reply: FastifyReply) => {
            console.log("test")
            try {
                const forwardedProto = (request.headers['x-forwarded-proto'] as string) ||
                    (request.headers['x-forwarded-protocol'] as string);
                const protocol = forwardedProto
                    ? forwardedProto.split(',')[0].trim()
                    : 'https';

                const forwardedHost = (request.headers['x-forwarded-host'] as string) ||
                    (request.headers.host as string) ||
                    'localhost' || '127.0.0.1'

                const host = forwardedHost.split(',')[0].trim();

                const url = new URL(request.url, `${protocol}://${host}`);

                console.log("API Auth Request URL:", url.toString());
                const headers = new Headers();

                Object.entries(request.headers).forEach(([key, value]) => {
                    if (value) {
                        if (Array.isArray(value)) {
                            value.forEach((v) => headers.append(key, v));
                        } else {
                            headers.append(key, value.toString());
                        }
                    }
                });

                const req = new Request(url.toString(), {
                    method: request.method,
                    headers,
                    body:
                        request.body &&
                        request.method !== "GET" &&
                        request.method !== "HEAD"
                            ? JSON.stringify(request.body)
                            : undefined,
                });

                const response = await auth.handler(req);
                reply.status(response.status);
                response.headers.forEach((value, key) => reply.header(key, value));
                reply.send(response.body ? await response.text() : null);
            } catch (error) {
                console.error("Authentication Error:", error);
                reply.status(500).send({
                    error: "Internal authentication error",
                    code: "AUTH_FAILURE",
                });
            }
        });

		try {
			await app.listen({
				port: Number(process.env.API_PORT),
				host: "0.0.0.0",
			});
			app.log.info(`[server] listening on ${app.server.address()}`);
            console.log("routees", app.printRoutes())
		} catch (err) {
			app.log.error(err);
		}

		app.ready(() => {
			console.log("[Server] :: Dashboard routes loaded");
		});

		return app;
	}
}

export default DashboardServer;
