import pc from "picocolors";
import { CustomBot, type SkyndalexClient } from "#classes";
import { deploy } from "#utils";
export async function ready(client: SkyndalexClient) {
	const commands = await deploy(client);
	if (client.user.id === process.env.CLIENT_ID) {
		const customBots = await client.prisma.custombots.findMany();
		for (const customBot of customBots) {
			if (customBot.status === "online") {
				const custombotInstance = client.customInstances.get(
					`${customBot.userId}-${customBot.id}`,
				);
				if (!custombotInstance) {
					const customClient = new CustomBot(
						customBot.token,
						commands,
						client.components,
						client.modals,
						customBot.activity,
					);

					await customClient.init();

					client.customInstances.set(
						`${customBot.userId}-${customBot.id}`,
						customClient,
					);
				}
			}
		}
	}
	const logStatus =
		client.user.id !== process.env.CLIENT_ID
			? pc.red(`[CUSTOMBOT]`)
			: pc.green(`[BOT]`);

	console.log(
		`${logStatus} ${client.user.username}: Ready in ${
			(performance.now() - client.createdAt) / 1000
		}s (commands: ${client.commands.size}, components: ${
			client.components.size
		}, guilds: ${client.guilds.cache.size}, users: ${
			client.users.cache.size
		})`,
	);
}
