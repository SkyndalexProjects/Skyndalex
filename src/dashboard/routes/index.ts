import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default async function index(fastify: FastifyInstance) {
	fastify.get("/", async (req: FastifyRequest, reply: FastifyReply) => {
		const token = req.cookies.token;

		if (!token) return reply.redirect(process.env.OAUTH_URL) 

		reply.redirect("http://localhost:5173");
	});
}
