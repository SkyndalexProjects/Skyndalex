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

	const amountToDep = interaction.options.getInteger("amount");
	if (amountToDep > Number.parseInt(user?.wallet || "0"))
		return interaction.reply(client.i18n.t("ECONOMY_NOT_ENOUGH_MONEY"));

	const updateUser = await client.prisma.economy.upsert({
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
				Number.parseInt(user?.wallet || "0") - amountToDep
			).toString(),
			bank: (Number.parseInt(user?.bank || "0") + amountToDep).toString(),
		},
		update: {
			wallet: (
				Number.parseInt(user?.wallet || "0") - amountToDep
			).toString(),
			bank: (Number.parseInt(user?.bank || "0") + amountToDep).toString(),
		},
	});

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("ECONOMY_DEP_TITLE")
		.setDescription("ECONOMY_DEP_DESC", {
			amount: Number.parseInt(user?.wallet || "0"),
		})
		.setColor("Blurple")
		.setTimestamp();
	return interaction.reply({ embeds: [embed] });
}

export const data = new SlashCommandBuilder()
	.setName("dep")
	.setDescription("Deploy your money to bank")
	.addIntegerOption((option) =>
		option
			.setName("amount")
			.setDescription("Amount to deploy")
			.setRequired(true),
	);
