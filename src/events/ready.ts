import { REST, Routes } from "discord.js";
import { parseCommands } from "#utils";
import type { SkyndalexClient } from "#classes";

export async function ready(client: SkyndalexClient) {
	const commands = await parseCommands(client);

	// const rest = new REST().setToken(client.token);
	// rest.put(Routes.applicationCommands(client.user.id), { body: commands });

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
