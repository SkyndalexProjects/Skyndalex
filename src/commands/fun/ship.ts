import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client";
import { randomBytes } from "node:crypto";
import { EmbedBuilder } from "classes/builders/EmbedBuilder";
import type { ainasepicsAPI } from "types/structures";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();

	const randomValue = randomBytes(1)[0] % 100;

	const user1 = interaction.options.getUser("who");
	const user2 = interaction.options.getUser("to-who");

	const generateImage =
		interaction.options.getBoolean("generate-image") ?? true;

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("FUN_SHIP_TITLE")
		.setDescription("FUN_SHIP_DESCRIPTION", {
			user1: user1.username,
			user2: user2.username,
			percentage: randomValue,
		})
		.setColor("DarkRed");

	if (generateImage) {
		const response = await fetch(
			"https://ainasepics-api.onrender.com/api/v2/get-resource?name=kiss",
		);
		const data = (await response.json()) as ainasepicsAPI;
		embed.setImage(data.url);
	}

	return interaction.editReply({ embeds: [embed] });
}

export const data = new SlashCommandBuilder()
	.setName("ship")
	.setDescription("Ship two users!")
	.addUserOption((option) =>
		option
			.setName("who")
			.setDescription("First user to ship")
			.setRequired(true),
	)
	.addUserOption((option) =>
		option
			.setName("to-who")
			.setDescription("Second user to ship")
			.setRequired(true),
	)
	.addBooleanOption((option) =>
		option
			.setName("generate-image")
			.setDescription("Generate image from anime gallery?")
			.setRequired(false),
	);
