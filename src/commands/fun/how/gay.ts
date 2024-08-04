import { randomBytes } from "node:crypto";
import type { ChatInputCommandInteraction } from "discord.js";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();

	const randomValue = randomBytes(1)[0] % 100;

	const user = interaction.options.getUser("who") || interaction.user;

	const embed = new EmbedBuilder(client, interaction.locale)
		.setDescription("HOW_GAY", {
			user: user.username,
			percent: randomValue,
		})
		.setColor("Random")
		.setTimestamp();

	return interaction.editReply({ embeds: [embed] });
}
