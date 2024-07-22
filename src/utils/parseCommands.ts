import {
	SlashCommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	Routes,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
export function parseCommands(client: SkyndalexClient) {
	const parsedCommands = [];
	const addedCommands = new Set();

	for (const [key, value] of client.commands) {
		if (key.includes("/")) {
			if (!key.includes("index") || key.split("/").length > 2) continue;

			const [commandName] = key.split("/");

			const subcommands = client.commands.filter(
				(x, v) =>
					v.startsWith(`${commandName}/`) && !v.includes("index"),
			);

			const command = value.data as SlashCommandBuilder;

			for (const [key, subcommandValue] of subcommands.entries()) {
				if (key.split("/").length <= 2) {
					if (
						command instanceof SlashCommandBuilder &&
						!addedCommands.has(key)
					) {
						command.addSubcommand(
							// @ts-expect-error
							subcommandValue.data,
						);
						addedCommands.add(key);
					}
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

					if (
						groupIndex.data instanceof
						SlashCommandSubcommandGroupBuilder
					) {
						for (const [gk, gv] of groups.entries()) {
							if (!addedCommands.has(gk)) {
								groupIndex.data.addSubcommand(
									// @ts-expect-error
									gv.data,
								);
								addedCommands.add(gk);
							}
						}

						if (
							command instanceof SlashCommandBuilder &&
							!addedCommands.has(`${commandName}/${groupName}`)
						) {
							command.addSubcommandGroup(
								groupIndex.data as SlashCommandSubcommandGroupBuilder,
							);
							addedCommands.add(`${commandName}/${groupName}`);
						}
					}
				}
			}
			if (!addedCommands.has(commandName)) {
				parsedCommands.push(command);
				addedCommands.add(commandName);
			}
		} else {
			if (!addedCommands.has(key)) {
				parsedCommands.push(value.data);
				addedCommands.add(key);
			}
		}
	}

	return parsedCommands;
}
