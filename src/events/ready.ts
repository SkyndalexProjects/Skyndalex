import { SkyndalexClient } from "#classes";
import { deploy } from "#utils";
let isReady = false;

export async function ready(client: SkyndalexClient) {
	if (isReady) return;
    isReady = true;

	await deploy(client);

	const customBots = await client.prisma.custombots.findMany();

	for (const customBot of customBots) {
		if (customBot.status === "online") {
			const custombotInstance = client.customInstances.get(
				`${customBot.userId}-${customBot.id}`,
			);
			if (!custombotInstance) {
				const customClient = new SkyndalexClient(customBot.activity);
				await customClient.init(customBot.token);
				client.customInstances.set(
					`${customBot.userId}-${customBot.id}`,
					customClient
				);
			}
		}
	}
	
		client.logger.success(
		`${client.user.username}: Ready in ${((performance.now() - client.createdAt) / 1000).toFixed(
			2,
		)}s (commands: ${client.commands.size}, components: ${
			client.components.size
		}, guilds: ${client.guilds.cache.size}, users: ${
			client.users.cache.size
		})`,
	);
}
