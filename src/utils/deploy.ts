import { SkyndalexClient } from "#classes";
import { SlashCommandSubcommandBuilder, SlashCommandBuilder } from "discord.js";
const parsedCommands: SlashCommandBuilder[] = [];

export async function deploy(client: SkyndalexClient) {
	const commands = client.commands;
	if (parsedCommands.length === 0)
		commands.forEach(async (cmd, key) => {
			if (key.includes("/")) {
				const [name, subcommand] = key.split("/");
				if (subcommand !== "index") return;
				const subcommands = commands.filter(
					(value, key) =>
						key.startsWith(`${name}/`) && key !== `${name}/index`,
				);
				const command = cmd.data;
				subcommands.forEach((subcmd) => {
					command.addSubcommand(
						subcmd.data as unknown as SlashCommandSubcommandBuilder,
					);
				});
				parsedCommands.push(command);
			} else {
				parsedCommands.push(cmd.data);
			}
		});

	client.rest.put(`/applications/${client.user.id}/commands`, {
		body: parsedCommands,
	});
}
