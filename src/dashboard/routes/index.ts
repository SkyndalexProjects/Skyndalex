import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import crypto from "crypto";
export default async function index(fastify: FastifyInstance) {
	fastify.get("/", async (req: FastifyRequest, reply: FastifyReply) => {
		const token = req.cookies.token;

		if (!token) {
			if (!process.env.OAUTH_URL) {
				console.log(
					"OAUTH_URL is not defined in the environment variables.",
				);
				return reply.code(500).send("Server configuration error.");
			}

			const state = crypto.randomBytes(32).toString("hex");

			reply.setCookie("csrf_token", state, {
				domain: "localhost",
				path: "/",
				secure: false,
				httpOnly: true,
				maxAge: 100,
			});

			return reply.redirect(`${process.env.OAUTH_URL}&state=${state}`);
		}

		reply.redirect("http://localhost:5173");
	});
}
