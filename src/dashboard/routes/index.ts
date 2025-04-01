import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

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
			return reply.redirect(process.env.OAUTH_URL);
		}

		reply.redirect("http://localhost:5173");
	});
}
