import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client.js";
import { EmbedBuilder } from "#builders";

interface cat {
	file: string;
}

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	try {
		await interaction.deferReply();
		const response = await fetch("http://aws.random.cat/meow");
		const cat = (await response.json()) as cat;

		console.log("cat", cat);
		const embed = new EmbedBuilder(client, interaction.locale)
			.setTitle("FUN_CAT_TITLE")
			.setImage(cat.file);

		await interaction.editReply({ embeds: [embed] });
	} catch (error) {
		console.error(error);
		await interaction.editReply(
			"The API is not available at the moment. Please try again later.",
		);
	}
}

export const data = new SlashCommandBuilder()
	.setName("cat")
	.setDescription("Generate random cat");
