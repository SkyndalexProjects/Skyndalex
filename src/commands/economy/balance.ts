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
	const target = interaction.options.getUser("target") || interaction.user;
	const economy = await client.prisma.economy.findUnique({
		where: { userId: target?.id },
	});

	const wallet = Number(economy?.wallet ?? 0);
	const bank = Number(economy?.bank ?? 0);
	const total = wallet + bank;

	const embed = new EmbedBuilder(client, interaction.locale)
		.setAuthor({
			name: target.username,
			iconURL: target.avatarURL() ?? undefined,
		})
		.addFields([
			{ name: "💰 Wallet", value: `$${wallet.toLocaleString()}`, inline: true },
			{ name: "🏦 Bank", value: `$${bank.toLocaleString()}`, inline: true },
			{
				name: "💵 Total Balance",
				value: `$${total.toLocaleString()}`,
				inline: true,
			},
		])
		.setColor("Green");

	await interaction.reply({ embeds: [embed] });
}

export const data = new SlashCommandBuilder()
	.setName("balance")
	.setDescription("Check balance")
	.addUserOption((option) =>
		option.setName("target").setDescription("User to check balance"),
	);
