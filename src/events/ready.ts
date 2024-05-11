import type {
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../classes/Client";
export async function ready(client: SkyndalexClient) {
	// TODO: rewrite this for a better quality, use recursion functions
	const parsedCommands = [];

	for (const [key, value] of client.commands) {
		if (key.includes("/")) {
			if (!key.includes("index") || key.split("/").length > 2) continue;

			const [commandName] = key.split("/");

			const subcommands = client.commands.filter(
				(x, v) =>
					v.startsWith(`${commandName}/`) && !v.includes("index"),
			);

			const command = value.data;

			for (const [key, value] of subcommands.entries()) {
				if (key.split("/").length <= 2) {
					command.addSubcommand(
						value.data as unknown as SlashCommandSubcommandBuilder,
					);
				} else {
					const groupName = key.split("/")[1];

					const groups = client.commands.filter(
						(x, v) =>
							v.startsWith(`${commandName}/${groupName}`) &&
							!v.includes("index"),
					);

					const groupIndex = client.commands.get(
						`${commandName}/${groupName}/index`,
					);

					if (!groupIndex) continue;

					for (const [gk, gv] of groups.entries()) {
						groupIndex?.data.addSubcommand(
							gv.data as unknown as SlashCommandSubcommandBuilder,
						);
					}

					command.addSubcommandGroup(
						groupIndex.data as unknown as SlashCommandSubcommandGroupBuilder,
					);
				}
			}
			parsedCommands.push(command.toJSON());
		} else {
			parsedCommands.push(value.data);
		}
	}

	const globalData = await client.application.commands.set(parsedCommands);

	client.logger.success(
		`Ready in ${((performance.now() - client.createdAt) / 1000).toFixed(
			2,
		)}s (commands: ${globalData.size})`,
	);
}
