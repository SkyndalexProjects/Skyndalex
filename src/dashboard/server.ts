import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import fastifyCookie from "@fastify/cookie";
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
        this.app = Fastify({ logger: true, trustProxy: true });
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
            preflightContinue: false,
            optionsSuccessStatus: 204
        });

        app.register(fastifyCookie, {
            secret: process.env.BETTER_AUTH_SECRET || 'super-secret-key',
            parseOptions: {
                secure: true,
                sameSite: 'none',
                httpOnly: true
            }
        });

        app.register(import("@fastify/rate-limit"), {
            max: 100,
            timeWindow: "1 minute",
        });

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
        app.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
            if (!request.url.startsWith("/auth/")) return;

            console.log("test")
            console.log("Request cookies:", request.cookies);
            console.log("Request headers:", request.headers);
            console.log("Request reply headers:", reply.headers);

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
                const responseBody = await response.text();

                console.log("Auth Response Status:", response.status);
                console.log("Auth Response Headers:", Array.from(response.headers.entries()));
                console.log("Auth Response Body:", responseBody);

                response.headers.forEach((value, key) => {
                    reply.header(key, value);
                    console.log(`Setting header: ${key} = ${value}`);
                });

                reply.status(response.status);
                reply.send(responseBody || null);
            } catch (error) {
                console.error("Authentication Error:", error);
                reply.status(500).send({
                    error: "Internal authentication error",
                    code: "AUTH_FAILURE",
                });
            }
        });
        app.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
            if (request.url.startsWith("/auth/")) return;

            try {
                console.log("All cookies:", request.cookies);
                console.log("Cookie header:", request.headers.cookie);

                const session = await auth.api.getSession({
                    headers: request.headers as any,
                });

                if (session) {
                    request.user = { id: session.user.id };
                    console.log("Session validated for user:", session.user.id);
                } else {
                    console.log("No valid session found");
                }
            } catch (error) {
                console.error("Session validation error:", error);
            }
        });
        try {
            await app.listen({
                port: Number(process.env.API_PORT),
                host: "0.0.0.0",
            });
            app.log.info(`[server] listening on ${app.server.address()}`);
            console.log("Routing", app.printRoutes())
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
