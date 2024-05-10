import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	EmbedBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../../classes/Client";
import { randomBytes } from "node:crypto";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();

	const randomValue = randomBytes(1)[0] % 100;

	const user = interaction.options.getUser("who") || interaction.user;

	const embed = new EmbedBuilder()
		.setDescription(`${user.username} is ${randomValue}% gay`)
		.setColor("Random")
		.setTimestamp();

	return interaction.editReply({ embeds: [embed] });
}

export const data = new SlashCommandSubcommandBuilder()
	.setName("gay")
	.setDescription("check who is gay")
	.addUserOption((option) => option.setName("who").setDescription("User"));
