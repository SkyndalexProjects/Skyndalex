import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import Docker from "dockerode";
import { resolve } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
interface Guild {
	id: string;
	name: string;
	icon: string;
	owner: boolean;
	permissions: string;
}

export default async function manageCustombots(fastify: FastifyInstance) {
	fastify.post(
		"/custombots/get",
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			const getId = request.params.id;

			const getCustombots =
				await request.client.prisma.custombots.findMany({
					where: {
						guildId: getId,
					},
				});
			console.log("[Server] :: Settings (custombots get) requested");
			return getCustombots;
		},
	);

	interface AddCustomBotBody {
		guildId: string;
		clientId: string;
		token: string;
		activity: string;
		status: string;
		value?: string;
		userId?: string;
		date?: string;
	}

	fastify.post(
		"/custombots/add",
		async (
			request: FastifyRequest<{ Body: AddCustomBotBody }>,
			reply: FastifyReply,
		) => {
			const body = request.body;
			const { guildId, token, activity, status, value, userId } = body;
			const addCustombot = await request.client.prisma.custombots.create({
				data: {
					guildId,
					token,
					activity,
					status,
				},
			});

			console.log("[Server] :: Custombot added");

			await request.client.prisma.dashboardLogs.create({
				data: {
					guildId,
					value,
					userId,
					date: BigInt(new Date().getTime()),
				},
			});

			console.log("[Server] :: Dashboard log added");

			return addCustombot;
		},
	);
	fastify.post(
		"/custombots/start",
		async (
			request: FastifyRequest<{
				Body: {
					token: string;
					id: string;
				};
			}>,
			reply: FastifyReply,
		) => {
			console.log("[Server] :: Custombot start requested");
			try {
				const token = request.body.token;
				const clientId = atob(token.split(".")[0]);
				const docker = new Docker({
					socketPath: "/var/run/docker.sock",
				});
				const __filename = fileURLToPath(import.meta.url);
				const __dirname = dirname(__filename);
				const dataPath = resolve(__dirname, "../../../../../data");

				try {
					const container = await docker.createContainer({
						name: `custombot-${clientId}`,
						Image: "skyndalex:stable",
						Env: [
							`BOT_TOKEN=${token}`,
							`DATABASE_URL=postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@host.docker.internal:5432/${process.env.POSTGRES_DATABASE}?schema=public`,
							`CLIENT_ID=${clientId}`,
							`POSTGRES_USER=${process.env.POSTGRES_USER}`,
							`POSTGRES_PASSWORD=${process.env.POSTGRES_PASSWORD}`,
							`POSTGRES_DB=${process.env.POSTGRES_DATABASE}`,
							`CLIENT_SECRET=${process.env.CLIENT_SECRET}`,
							`LAVALINK_URL=${process.env.LAVALINK_URL}`,
							`LAVALINK_PORT=${process.env.LAVALINK_PORT}`,
							`LAVALINK_SERVER_PASSWORD=${process.env.LAVALINK_SERVER_PASSWORD}`,
							`CUSTOMBOT_DB_PASSWORD=${process.env.CUSTOMBOT_DATABASE_PASSWORD}`,
							`API_PORT=${process.env.API_PORT}`,
							`API_ENDPOINT=${process.env.API_ENDPOINT}`,
							`_JAVA_OPTIONS=-Xmx6G`,
							`SERVER_PORT=${process.env.LAVALINK_PORT}`,
						],
						HostConfig: {
							ExtraHosts: ["host.docker.internal:host-gateway"],
							Binds: [`${dataPath}:/var/lib/postgresql/data:rw`],
						},
					});

					container.attach(
						{ stream: true, stdout: true, stderr: true },
						function (err, stream) {
							container.modem.demuxStream(
								stream,
								process.stdout,
								process.stderr,
							);
						},
					);

					console.log("Container created successfully", container);

					await container.start();

					reply.send({
						message: "Custombot started successfully",
					});
					console.log("[Server] :: Custombot started");
				} catch (error) {
					console.error(
						"Error creating or starting container:",
						error,
					);
					reply.send({
						error: "Failed to create or start custombot container",
						details:
							error instanceof Error
								? error.message
								: String(error),
					});
				}
			} catch (error) {
				console.error("Error:", error);
				reply.send({
					error: "Failed to start custombot",
					details:
						error instanceof Error ? error.message : String(error),
				});
			}
		},
	);
}
