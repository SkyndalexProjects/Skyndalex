import { SlashCommandBuilder } from "discord.js";

export const data = {
	...new SlashCommandBuilder()
		.setName("how")
		.setDescription("how someone is [...]"),
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};
