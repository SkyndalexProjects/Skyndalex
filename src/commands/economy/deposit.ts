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
	const userId = interaction.user.id;
	const amountInput = interaction.options.getString("amount", true);

	const economy = await client.prisma.economy.findUnique({
		where: { userId },
	});

	const wallet = economy?.wallet ?? 0;

	if (wallet <= 0) {
		return interaction.reply({
			content: "> You don't have any money in your wallet to deposit.",
			ephemeral: true,
		});
	}

	const isAll = amountInput.toLowerCase() === "all";
	const amount = isAll ? wallet : Number(amountInput);

	if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
		return interaction.reply({
			content: "> Please provide a valid whole number or `all`.",
			ephemeral: true,
		});
	}

	if (amount <= 0) {
		return interaction.reply({
			content: "> The deposit amount must be greater than zero.",
			ephemeral: true,
		});
	}

	if (amount > wallet) {
		return interaction.reply({
			content: `> You only have **$${wallet.toLocaleString()}** in your wallet.`,
			ephemeral: true,
		});
	}

	await client.economy.setMoney(client, userId, -amount);

	await client.prisma.economy.update({
		where: { userId },
		data: { bank: { increment: amount } },
	});

	const newWallet = wallet - amount;
	const newBank = (economy?.bank ?? 0) + amount;

	const embed = new EmbedBuilder(client, interaction.locale)
		.setRawDescription(
			`> Successfully deposited **$${amount.toLocaleString()}** to your bank.`,
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
	.setName("deposit")
	.setDescription("Deposit your money to the bank")
	.addStringOption((option) =>
		option
			.setName("amount")
			.setDescription("Amount to deposit (or 'all')")
			.setRequired(true),
	);
