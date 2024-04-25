import type { SkyndalexClient } from "../classes/Client";
import type {
	SlashCommandSubcommandGroupBuilder,
	SlashCommandSubcommandBuilder,
} from "discord.js";
export async function ready(client: SkyndalexClient) {
	const parsedCommands = [];

	for (const [key, value] of client.commands) {
		if (key.includes("/")) {
			const [name, subGroup, subCommand] = key.split("/");
			if (subCommand !== "index") continue;
			const cmd = client.commands.find((cmd) => cmd.data.name === name);

			const subcommands = client.commands.filter(
				(value, subKey) =>
					subKey.startsWith(`${name}/`) && subKey !== `${name}/index`,
			);
			const command = cmd.data;

			for (const [subKey, subValue] of subcommands) {
				if (subKey.includes("index")) {
					command.addSubcommandGroup(
						subValue.data as unknown as SlashCommandSubcommandGroupBuilder,
					);
					for (const [subSubKey, subSubValue] of subcommands) {
						if (subSubKey.includes("index")) continue;

						subValue.data.addSubcommand(
							subSubValue.data as unknown as SlashCommandSubcommandBuilder,
						);
					}
				}
			}
			parsedCommands.push(command);
		} else {
			if (!parsedCommands.includes(value.data)) {
				parsedCommands.push(value.data);
			}
		}
	}
	const globalData = await client.application.commands.set(parsedCommands);

	client.logger.success(
		`Ready in ${((performance.now() - client.createdAt) / 1000).toFixed(
			2,
		)}s (commands: ${globalData.size})`,
	);
}
