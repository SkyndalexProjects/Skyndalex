import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { auth } from "../../auth.js";
export default async function index(fastify: FastifyInstance) {
	fastify.get("/", async (req: FastifyRequest, reply: FastifyReply) => {
		const session = await auth.api.getSession({
			headers: req.headers,
		});

		if (!session) {
			return reply.redirect(`${process.env.OAUTH_URL}`);
		}

		reply.redirect(`${process.env.FRONTEND_URL}/dashboard/guild`);
	});
}
