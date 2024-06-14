import { SlashCommandBuilder } from "discord.js";

export const data = {
	...new SlashCommandBuilder()
		.setName("how")
		.setDescription("how someone is [...]")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("gay")
				.setDescription("Ask how someone is")
				.addUserOption((option) =>
					option
						.setName("who")
						.setDescription("User")
						.setRequired(true),
				),
		),
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};
