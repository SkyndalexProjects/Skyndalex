import {
	type ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "#builders";
const successChance = 0.4;

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const target = interaction.options.getUser("target", true);
	const userId = interaction.user.id;

	if (target.id === userId) {
		return interaction.reply({
			content: "> You can't rob yourself!",
			flags: MessageFlags.Ephemeral,
		});
	}

	if (target.bot) {
		return interaction.reply({
			content: "> You can't rob a bot!",
			flags: MessageFlags.Ephemeral,
		});
	}

	const targetEconomy = await client.prisma.economy.findUnique({
		where: { userId: target.id },
	});

	const targetWallet = targetEconomy?.wallet ?? 0;

	if (targetWallet <= 0) {
		return interaction.reply({
			content: `> **${target.username}** has nothing in their wallet to steal!`,
			flags: MessageFlags.Ephemeral,
		});
	}

	const maxSteal = Math.min(targetWallet, 100);
	const amount = Math.floor(Math.random() * maxSteal) + 1;

	const isSuccess = Math.random() < successChance;
	const status = isSuccess ? "success" : "fail";
	const messagesKey = `economy.rob.${status}`;

	if (isSuccess) {
		await client.economy.setMoney(client, target.id, -amount);
		await client.economy.setMoney(client, userId, +amount);
	} else {
		await client.economy.setMoney(client, userId, -amount);
	}

	const messages = client.i18n.t(messagesKey, {
		lng: interaction.locale,
		returnObjects: true,
	}) as string[];

	const randomIndex = Math.floor(Math.random() * messages.length);

	const message = messages[randomIndex]
		.replace("{{amount}}", amount.toString())
		.replace(/\{\{target\}\}/g, target.toString());

	const embed = new EmbedBuilder(client, interaction.locale)
		.setRawDescription(message)
		.setColor(isSuccess ? "Green" : "Red");

	await interaction.reply({ embeds: [embed] });
}

export const data = new SlashCommandBuilder()
	.setName("rob")
	.setDescription("Rob another user.")
	.addUserOption((option) =>
		option
			.setName("target")
			.setDescription("The user to rob")
			.setRequired(true),
	);
