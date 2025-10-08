import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import crypto from "crypto";
import { auth } from "../auth.js";
export default async function index(fastify: FastifyInstance) {
	fastify.get("/", async (req: FastifyRequest, reply: FastifyReply) => {
		const session = await auth.api.getSession({
			headers: req.headers,
		});
		const state = crypto.randomBytes(32).toString("hex");

		if (!session) {
			return reply.redirect(`${process.env.OAUTH_URL}&state=${state}`);
		}
		reply.redirect("http://localhost:5173/dashboard");
	});
}
