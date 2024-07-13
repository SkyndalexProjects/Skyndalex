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
			case "launching":
				return this.client.prisma.custombots.update({
					where: {
						id_userId: {
							id: custombot.id,
							userId,
						},
					},
					data: {
						status: "launching",
					},
				});
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
		}
	}
}
