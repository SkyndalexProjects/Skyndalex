import type { SkyndalexClient } from "../Client.js";
export class CustomBotManagement {
	constructor(private readonly client: SkyndalexClient) {
		this.client = client;
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
