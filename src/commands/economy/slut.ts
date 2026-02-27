import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "../../classes/builders/index.js";
const successChance = 0.6;

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const isSuccess = Math.random() < successChance;

	const amount = Math.floor(Math.random() * 100) + 1;

	const status = isSuccess ? "success" : "fail";
	const messagesKey = `economy.slut.${status}`;

	// TODO: fix repeated code

	const messages = client.i18n.t(messagesKey, {
		lng: interaction.locale,
		returnObjects: true,
	}) as string[];

	const randomIndex = Math.floor(Math.random() * messages.length);
	const message = messages[randomIndex].replace(
		"{{amount}}",
		amount.toString(),
	);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setRawDescription(message)
		.setColor(isSuccess ? "Green" : "Red");

	await interaction.reply({ embeds: [embed] });
}

export const data = new SlashCommandBuilder()
	.setName("slut")
	.setDescription("Slut");
