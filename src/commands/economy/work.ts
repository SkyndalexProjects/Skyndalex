import { randomBytes } from "node:crypto";
import { EmbedBuilder } from "classes/builders/EmbedBuilder";
import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client";
import { updateWallet } from "utils/updateWallet";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const randomValue = randomBytes(1)[0] % 100;
	const updateUser = await updateWallet(
		client,
		interaction.guild.id,
		interaction.user.id,
		+randomValue,
	);

	console.log("updateUser", updateUser);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("Work")
		.setDescription(
			`You worked and earned ${randomValue} coins! Your balance is now ${updateUser?.wallet} coins.`,
		)
		.setColor("Green");

	return interaction.reply({ embeds: [embed] });
}

export const data = new SlashCommandBuilder()
	.setName("work")
	.setDescription("work");
