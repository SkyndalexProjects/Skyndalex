import {
	type ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "#builders";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const userId = interaction.user.id;
	const amountInput = interaction.options.getString("amount", true);

	const economy = await client.prisma.economy.findUnique({
		where: { userId },
	});

	const bank = economy?.bank ?? 0;

	if (bank <= 0) {
		return interaction.reply({
			content: "> You don't have any money in your bank to withdraw.",
			flags: MessageFlags.Ephemeral,
		});
	}

	const isAll = amountInput.toLowerCase() === "all";
	const amount = isAll ? bank : Number(amountInput);

	if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
		return interaction.reply({
			content: "> Please provide a valid whole number or `all`.",
			flags: MessageFlags.Ephemeral,
		});
	}

	if (amount <= 0) {
		return interaction.reply({
			content: "> The withdraw amount must be greater than zero.",
			flags: MessageFlags.Ephemeral,
		});
	}

	if (amount > bank) {
		return interaction.reply({
			content: `> You only have **$${bank.toLocaleString()}** in your bank.`,
			flags: MessageFlags.Ephemeral,
		});
	}

	await client.economy.setMoney(client, userId, amount);

	await client.prisma.economy.update({
		where: { userId },
		data: { bank: { decrement: amount } },
	});

	const newWallet = (economy?.wallet ?? 0) + amount;
	const newBank = bank - amount;

	const embed = new EmbedBuilder(client, interaction.locale)
		.setRawDescription(
			`> Successfully withdrew **$${amount.toLocaleString()}** from your bank.`,
		)
		.addFields([
			{
				name: "💰 Wallet",
				value: `$${newWallet.toLocaleString()}`,
				inline: true,
			},
			{ name: "🏦 Bank", value: `$${newBank.toLocaleString()}`, inline: true },
		])
		.setColor("Green");

	await interaction.reply({ embeds: [embed] });
}

export const data = new SlashCommandBuilder()
	.setName("withdraw")
	.setDescription("Withdraw your money from the bank")
	.addStringOption((option) =>
		option
			.setName("amount")
			.setDescription("Amount to withdraw (or 'all')")
			.setRequired(true),
	);
