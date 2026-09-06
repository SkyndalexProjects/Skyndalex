import type {
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

const parsedCommands: SlashCommandBuilder[] = [];

export async function deploy(client: SkyndalexClient) {
	const commands = client.commands;
	if (parsedCommands.length === 0) {
		for (const [key, cmd] of commands.entries()) {
			if (key.includes("/")) {
				const [name, subcommand] = key.split("/");
				if (subcommand !== "index") continue;
				const subcommands = commands.filter(
					(_value, k) => k.startsWith(`${name}/`) && k !== `${name}/index`,
				);
				const command = cmd.data;
				for (const subcmd of subcommands.values()) {
					command.addSubcommand(
						subcmd.data as unknown as SlashCommandSubcommandBuilder,
					);
				}
				parsedCommands.push(command);
			} else {
				parsedCommands.push(cmd.data);
			}
		}
	}

	await client.rest.put(`/applications/${client.user?.id}/commands`, {
		body: parsedCommands,
	});

	return commands;
}
