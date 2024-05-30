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
	let q = "";
	let text = "";

	const user1 = interaction.options.getUser("who");
	const user2 = interaction.options.getUser("to-who");
	const randomValue = randomBytes(1)[0] % 100;

	const generateImage =
		interaction.options.getBoolean("generate-image") ?? true;

	if (randomValue < 20) {
		// 0-20%
		q = "punch";
		text = client.i18n.t("FUN_SHIP_PUNCH", {
			lng: interaction.locale,
			user1: user1.username,
			user2: user2.username,
			percentage: randomValue,
		});
	} else if (randomValue > 20 && randomValue < 50) {
		// 20-50%
		q = "hug";
		text = client.i18n.t("FUN_SHIP_HUG", {
			lng: interaction.locale,
			user1: user1.username,
			user2: user2.username,
			percentage: randomValue,
		});
	} else {
		q = "kiss";
		text = client.i18n.t("FUN_SHIP_KISS", {
			// 50-100%
			lng: interaction.locale,
			user1: user1.username,
			user2: user2.username,
			percentage: randomValue,
		});
	}

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("FUN_SHIP_TITLE")
		.setDescription(text)
		.setColor("DarkRed");

	await interaction.deferReply();

	if (generateImage) {
		const response = await fetch(
			`https://ainasepics-api.onrender.com/api/v2/get-resource?name=${q}`,
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
