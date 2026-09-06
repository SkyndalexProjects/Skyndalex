import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();

	interface randomDog {
		url: string;
	}

	const response = await fetch("https://random.dog/woof.json");
	const dog = (await response.json()) as randomDog;

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("fun.random_dog_title")
		.setImage(dog.url)
		.setColor("Random");
	return interaction.editReply({ embeds: [embed] });
}

export const data = new SlashCommandBuilder()
	.setName("dog")
	.setDescription("Send random dog photo")
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
