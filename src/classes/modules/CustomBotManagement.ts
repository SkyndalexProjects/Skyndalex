import type { SkyndalexClient } from "../Client.js";

export class CustomBotManagement {
	constructor(private readonly client: SkyndalexClient) {
		this.client = client;
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
	async findCustomBots(userId: string) {
		return this.client.prisma.custombots.findMany({
			where: {
				userId,
			},
		});
	}
	async getCustomBotNames(
		custombots: Array<{ clientId: string; id: number }>,
	) {
		return await Promise.all(
			custombots.map(async (custombot) => {
				const bot = await this.client.users.fetch(custombot.clientId);
				return {
					...custombot,
					name: bot.username,
				};
			}),
		);
	}
	async updatePowerState(
		id: string,
		userId: string,
		status: string,
	) {
		return this.client.prisma.custombots.update({
			where: {
				id_userId: {
					id: Number.parseInt(id),
					userId,
				},
			},
			data: {
				status: status,
			},
		});
	}
}
