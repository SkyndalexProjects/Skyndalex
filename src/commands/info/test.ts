import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const embed = new EmbedBuilder().setDescription(
		client.i18n.t("TEST", { lng: interaction.locale }),
	);
	return interaction.reply({ embeds: [embed] });
}
export const data = new SlashCommandBuilder()
	.setName("test")
	.setDescription("test");
