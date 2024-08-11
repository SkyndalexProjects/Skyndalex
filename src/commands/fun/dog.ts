import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";
import type { randomDog } from "#types";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();
	const response = await fetch("https://random.dog/woof.json");
	const dog = (await response.json()) as randomDog;

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("FUN_DOG_TITLE")
		.setImage(dog.url)
		.setColor("Random");
	return interaction.editReply({ embeds: [embed] });
}

export const data = {
	...new SlashCommandBuilder()
		.setName("dog")
		.setDescription("Generate random dog"),
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};
