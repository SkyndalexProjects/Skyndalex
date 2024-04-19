import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client";
import { EmbedBuilder } from "../../classes/builders/EmbedBuilder";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	client.logger.error("DUPA")

	// const embed = new EmbedBuilder(client, interaction.locale)
	// 	.setDescription(
	// 		`${client.i18n.t("TEST", {
	// 			lng: interaction.locale,
	// 			commandName: interaction.commandName,
	// 		})}`,
	// 	)
	// 	.setFooter({ text: "TEST" });
	// return interaction.reply({ embeds: [embed] });
}
export const data = new SlashCommandBuilder()
	.setName("test")
	.setDescription("test");
