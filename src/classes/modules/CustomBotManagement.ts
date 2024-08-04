import type { SkyndalexClient } from "../Client.js";
import { execSync, fork } from "node:child_process";

export class CustomBotManagement {
	constructor(private readonly client: SkyndalexClient) {
		this.client = client;
	}

	async init(clientId: string, botToken: string) {
		const result = await this.client.prisma
			.$executeRaw`CREATE DATABASE custombot_${clientId};`.catch(
			() => null,
		);

		const DBURL = `postgresql://postgres:${encodeURIComponent(
			process.env.CUSTOMBOT_DB_PASSWORD,
		)}@localhost:5432/custombot_${clientId}?schema=public`;

		switch (process.platform) {
			case "win32":
				execSync(`SET DATABASE_URL=${DBURL} && npx prisma db push`, {
					stdio: "inherit",
				});
				break;
			case "linux":
				execSync(`export DATABASE_URL=${DBURL} && npx prisma db push`, {
					stdio: "inherit",
				});
				

				const processInfo = await fork("./src/customBot", [clientId], {
					env: {
						BOT_TOKEN: botToken,
						LAVALINK_URL: "0.0.0.0:2333",
						LAVALINK_SERVER_PASSWORD: "youshallnotpass"
					},
				});

				const presences = await this.client.prisma.custombots.findMany({
					where: {
						clientId: clientId,
					},
				});
				if (presences.length < 1) return;

				processInfo.send({
					name: "changePresence",
					presence: presences[0].activity,
				});
		}
	}
	async updatePowerState(id: string, userId: string, powerState: string) {
		const custombot = await this.client.prisma.custombots.findUnique({
			where: {
				id_userId: {
					id: Number.parseInt(id),
					userId,
				},
			},
		});

		const bot = await this.client.users.fetch(custombot.clientId);

		switch (powerState) {
			case "working":
				return this.client.prisma.custombots.update({
					where: {
						id_userId: {
							id: custombot.id,
							userId,
						},
					},
					data: {
						status: "working",
					},
				});
				break;
			case "error":
				return this.client.prisma.custombots.update({
					where: {
						id_userId: {
							id: custombot.id,
							userId,
						},
					},
					data: {
						status: "error",
					},
				});
				break;
			case "offline":
				return this.client.prisma.custombots.update({
					where: {
						id_userId: {
							id: custombot.id,
							userId,
						},
					},
					data: {
						status: "offline",
					},
				});
				break;
		}
	}
	async findCustomBot(id: string, userId: string) {
		return this.client.prisma.custombots.findUnique({
			where: {
				id_userId: {
					id: Number.parseInt(id),
					userId,
				},
			},
		});
	}
}
