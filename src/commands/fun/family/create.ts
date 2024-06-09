import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	interaction.reply("nah");
}

export const data = new SlashCommandSubcommandBuilder()
	.setName("create")
	.setDescription("Create a family")
	.addStringOption((option) =>
		option
			.setName("name")
			.setDescription("The name of the family")
			.setRequired(true),
	);
