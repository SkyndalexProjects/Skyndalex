import type { SkyndalexClient } from "#classes";
import { deploy } from "#utils";
export async function ready(client: SkyndalexClient) {
	// const commands = parseCommands(client.commands);

	await deploy(client);
	client.logger.success(
		`Ready in ${((performance.now() - client.createdAt) / 1000).toFixed(
			2,
		)}s (commands: ${client.commands.size}, components: ${
			client.components.size
		}, guilds: ${client.guilds.cache.size}, users: ${
			client.users.cache.size
		})`,
	);
}
