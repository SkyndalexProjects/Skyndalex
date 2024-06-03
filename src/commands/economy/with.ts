import { EmbedBuilder } from "../../classes/builders/EmbedBuilder.js";
import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client.js";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const user = await client.prisma.economy.findFirst({
		where: {
			userId: interaction.user.id,
		},
	});

	const amountToWith = interaction.options.getInteger("amount");
	if (amountToWith > Number.parseInt(user?.bank || "0"))
		return interaction.reply(client.i18n.t("ECONOMY_NOT_ENOUGH_MONEY"));

	await client.prisma.economy.upsert({
		where: {
			guildId_userId: {
				guildId: interaction.guild.id,
				userId: interaction.user.id,
			},
		},
		create: {
			guildId: interaction.guild.id,
			userId: interaction.user.id,
			wallet: (
				Number.parseInt(user?.wallet || "0") + amountToWith
			).toString(),
			bank: (
				Number.parseInt(user?.bank || "0") - amountToWith
			).toString(),
		},
		update: {
			wallet: (
				Number.parseInt(user?.wallet || "0") + amountToWith
			).toString(),
			bank: (
				Number.parseInt(user?.bank || "0") - amountToWith
			).toString(),
		},
	});

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("ECONOMY_WITH_TITLE")
		.setDescription("ECONOMY_WITH_DESC", {
			amount: amountToWith,
		})
		.setColor("Blurple")
		.setTimestamp();
	return interaction.reply({ embeds: [embed] });
}

export const data = new SlashCommandBuilder()
	.setName("with")
	.setDescription("Withdrawal your money from bank")
	.addIntegerOption((option) =>
		option
			.setName("amount")
			.setDescription("Amount to deploy")
			.setRequired(true),
	);
