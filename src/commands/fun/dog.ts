import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client.js";
import { EmbedBuilder } from "#builders";
import type { randomDog } from "../../types/structures";
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

export const data = new SlashCommandBuilder()
	.setName("dog")
	.setDescription("Generate random dog");
