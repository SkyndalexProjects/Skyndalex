import {
	SlashCommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	Collection,
} from "discord.js";
import type { Command } from "#types";

export function parseCommands(commands: Collection<string, Command>) {
	const parsedCommands = [];

	for (const [key, value] of commands.entries()) {
		if (key.includes("/")) {
			if (!key.includes("index") || key.split("/").length > 2) continue;

			const [commandName] = key.split("/");

			const subcommands = commands.filter(
				(x, v) =>
					v.startsWith(`${commandName}/`) && !v.includes("index"),
			);

			const command = value.data as SlashCommandBuilder;

			for (const [key, subcommandValue] of subcommands.entries()) {
				if (key.split("/").length <= 2) {
					if (command instanceof SlashCommandBuilder) {
						command.addSubcommand(
							// @ts-expect-error
							subcommandValue.data,
						);
					}
				} else {
					const groupName = key.split("/")[1];

					const groups = commands.filter(
						(x, v) =>
							v.startsWith(`${commandName}/${groupName}`) &&
							!v.includes("index"),
					);

					const groupIndex = commands.get(
						`${commandName}/${groupName}/index`,
					);
					if (!groupIndex) continue;

					if (
						groupIndex.data instanceof
						SlashCommandSubcommandGroupBuilder
					) {
						for (const [gk, gv] of groups.entries()) {
							groupIndex.data.addSubcommand(
								// @ts-expect-error
								gv.data,
							);
						}

						if (command instanceof SlashCommandBuilder) {
							command.addSubcommandGroup(
								groupIndex.data as SlashCommandSubcommandGroupBuilder,
							);
						}
					}
				}
			}
			parsedCommands.push(command);
		} else {
			parsedCommands.push(value.data);
		}
	}

	return parsedCommands;
}
