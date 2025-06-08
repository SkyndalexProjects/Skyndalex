import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import Docker from "dockerode";
import { resolve } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { PermissionFlagsBits } from "discord.js";
export default async function manageCustombots(fastify: FastifyInstance) {
	fastify.post(
		"/custombots/get",
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			const getId = request.client.guilds.cache.get(request.params.id)?.id;

			if (!getId) {
				reply.status(404).send({ error: "Guild not found" });
				return;
			}

			const getCustombots = await request.client.prisma.custombots.findMany({
				where: {
					guildId: getId,
				},
			});

			if (!getCustombots || getCustombots.length === 0) {
				reply.status(404).send({ error: "No custombots found for the guild" });
				return;
			}

			if (
				!getCustombots.every(
					(bot) => bot.guildId && bot.token && bot.activity && bot.status,
				)
			) {
				reply.status(500).send({ error: "Invalid custombot data" });
				return;
			}
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
		{
			schema: {
				body: {
					type: "object",
					properties: {
						guildId: { type: "string" },
						clientId: { type: "string" },
						token: { type: "string" },
						activity: { type: "string" },
						status: { type: "string" },
						value: { type: "string", nullable: true },
						userId: { type: "string", nullable: true },
						date: {
							type: "string",
							format: "date-time",
							nullable: true,
						},
					},
					required: ["guildId", "token", "activity", "status"],
				},
				response: {
					200: {
						type: "object",
						properties: {
							id: { type: "string" },
							guildId: { type: "string" },
							token: { type: "string" },
							activity: { type: "string" },
							status: { type: "string" },
							clientId: { type: "string" },
						},
						required: ["id", "guildId", "token", "activity", "status"],
					},
					500: {
						type: "object",
						properties: {
							error: { type: "string" },
						},
					},
				},
			},
		},
		async (
			request: FastifyRequest<{ Body: AddCustomBotBody }>,
			reply: FastifyReply,
		) => {
			const body = request.body;
			const { guildId, token, activity, status, value, userId, clientId } =
				body;
			const addCustombot = await request.client.prisma.custombots.create({
				data: {
					guildId,
					token,
					activity,
					status,
					clientId,
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
		{
			schema: {
				body: {
					type: "object",
					properties: {
						clientId: { type: "string" },
						requestedByUserId: { type: "string" },
						guildId: { type: "string" },
					},
					required: ["clientId", "requestedByUserId", "guildId"],
				},
				response: {
					200: {
						type: "object",
						properties: {
							message: { type: "string" },
							status: { type: "number" },
						},
						required: ["message", "status"],
					},
					500: {
						type: "object",
						properties: {
							error: { type: "string" },
							details: { type: "string" },
							status: { type: "number" },
						},
						required: ["error", "details", "status"],
					},
				},
			},
		},
		async (
			request: FastifyRequest<{
				Body: {
					clientId: string;
					requestedByUserId: string;
					guildId: string;
				};
			}>,
			reply: FastifyReply,
		) => {
			console.log("[Server] :: Custombot start requested");
			try {
				const clientId = request.body.clientId;
				console.log("request.body", request.body);
				const user = request.client.users.cache.get(
					request.body.requestedByUserId,
				);

				const guild = request.client.guilds.cache.get(request.body.guildId);

				if (!guild) {
					reply.status(404).send({
						error: "Guild not found",
						status: 404,
					});
					return;
				}

				const member = await guild.members.fetch(
					request.body.requestedByUserId,
				);

				if (!member) {
					reply.status(404).send({
						error: "User not found in the guild",
						status: 404,
					});
					return;
				}

				if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
					reply.status(403).send({
						error: "No permissions",
					});
					return;
				}

				const getBot = await request.client.prisma.custombots.findFirst({
					where: {
						guildId: request.body.guildId,
						clientId: clientId,
					},
				});
				if (!getBot) {
					console.log("[Server] :: Custombot not found");

					reply.status(404).send({
						error: "Custombot not found",
						status: 404,
					});
					return;
				}
				const token = getBot.token;

				console.log("[Server] :: Custombot token found", token);
				if (!token) {
					reply.status(400).send({
						error: "Token is required",
						status: 400,
					});
					return;
				}

				if (!clientId) {
					reply.status(400).send({
						error: "Client ID is required",
						status: 400,
					});
					return;
				}

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

					await container.start();

					reply.send({
						message: "Custombot started successfully",
						status: 200,
					});
				} catch (error) {
					console.error("Error creating or starting container:", error);
					reply.send({
						error: "Failed to create or start custombot container",
						details: error instanceof Error ? error.message : String(error),
						status: 500,
					});
				}
			} catch (error) {
				console.error("Error:", error);
				reply.send({
					error: "Failed to start custombot",
					details: error instanceof Error ? error.message : String(error),
				});
			}
		},
	);
	fastify.post(
		"/custombots/delete",
		{
			schema: {
				body: {
					type: "object",
					properties: {
						id: { type: "string" },
					},
					required: ["id"],
				},
				response: {
					200: {
						type: "object",
						properties: {
							message: { type: "string" },
							status: { type: "number" },
						},
						required: ["message", "status"],
					},
					500: {
						type: "object",
						properties: {
							error: { type: "string" },
							details: { type: "string" },
							status: { type: "number" },
						},
						required: ["error", "details", "status"],
					},
				},
			},
		},
		async (
			request: FastifyRequest<{
				Body: {
					id: string;
				};
			}>,
			reply: FastifyReply,
		) => {
			console.log("[Server] :: Custombot delete requested");
			try {
				const id = request.body.id;
				if (!id) {
					reply.status(400).send({
						error: "ID is required",
						status: 400,
					});
					return;
				}

				const docker = new Docker({
					socketPath: "/var/run/docker.sock",
				});

				const container = docker.getContainer(`custombot-${id}`);
				if (!container) {
					reply.status(404).send({
						error: "Container not found",
						status: 404,
					});
					return;
				}
				await container.stop();
				await container.remove();

				reply.send({
					message: "Custombot deleted successfully",
					status: 200,
				});
			} catch (error) {
				console.error("Error:", error);
				reply.send({
					error: "Failed to delete custombot",
					details: error instanceof Error ? error.message : String(error),
					status: 500,
				});
			}
		},
	);
}
