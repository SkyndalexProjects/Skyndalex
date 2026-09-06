import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";

const successChance = 0.75;
const cooldown = 24 * 60 * 60 * 1000;

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const userId = interaction.user.id;

	const economy = await client.prisma.economy.findUnique({
		where: { userId },
	});

	if (economy) {
		const nextAvailable = new Date(economy.updatedAt.getTime() + cooldown);
		if (Date.now() < nextAvailable.getTime()) {
			const timestamp = Math.floor(nextAvailable.getTime() / 1000);
			const embed = new EmbedBuilder(client, interaction.locale)
				.setRawDescription(
					`You already worked recently! You can work again <t:${timestamp}:R> (<t:${timestamp}:F>).`,
				)
				.setColor("Red");

			return interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}

	await client.economy.resolveGambleAction(interaction, "work", successChance);
}

export const data = new SlashCommandBuilder()
	.setName("work")
	.setDescription("Work to earn (or lose) some money!");
