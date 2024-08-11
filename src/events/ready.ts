import { SkyndalexClient } from "#classes";
import { deploy } from "#utils";

export async function ready(client: SkyndalexClient) {
	await deploy(client);

	if (client.user.id === process.env.CLIENT_ID) {
		const customBots = await client.prisma.custombots.findMany();
		for (const customBot of customBots) {
			if (customBot.status === "online") {
				const custombotInstance = client.customInstances.get(
					`${customBot.userId}-${customBot.id}`,
				);
				if (!custombotInstance) {
					const customClient = new SkyndalexClient(
						customBot.activity,
					);
					await customClient.init(customBot.token);
					client.customInstances.set(
						`${customBot.userId}-${customBot.id}`,
						customClient,
					);
				}
			}
		}
	}

	client.logger.success(
		`${client.user.username}: Ready in ${(
			(performance.now() - client.createdAt) /
			1000
		).toFixed(2)}s (commands: ${client.commands.size}, components: ${
			client.components.size
		}, guilds: ${client.guilds.cache.size}, users: ${
			client.users.cache.size
		})`,
	);
}
