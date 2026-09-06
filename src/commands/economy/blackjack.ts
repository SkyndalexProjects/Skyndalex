import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { blackjackInit, calculateHandValue } from "#utils";
import { EmbedBuilder } from "../../classes/builders/index.js";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const bet = Number(interaction.options.getString("bet") || "0");
	if (!Number.isSafeInteger(bet) || bet <= 0) {
		return interaction.reply({
			content:
				"```ansi\n> \u001b[2;33m\u001b[2;40mPlease enter a valid bet amount greater than 0.\u001b[0m\n```",
			ephemeral: true,
		});
	}
	if (client.blackjackGames.has(interaction.user.id)) {
		return interaction.reply({
			content:
				"```ansi\n> \u001b[2;33m\u001b[2;40mYou already have an active Blackjack game.\u001b[0m\n```",
			ephemeral: true,
		});
	}
	const economy = await client.prisma.economy.findUnique({
		where: { userId: interaction.user.id },
	});

	const wallet = economy?.wallet ?? 0;

	if (wallet < bet) {
		return interaction.reply({
			content:
				"```ansi\n" +
				`⚠ | \u001b[2;33m\u001b[2;40mYou don't have enough money to start this game.\u001b[0m\n` +
				`\`\`\`\n> ${wallet} < ${bet}`,
			ephemeral: true,
		});
	}

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId("blackjack_hit")
			.setLabel("Hit")
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId("blackjack_stand")
			.setLabel("Stand")
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId("blackjack_doubledown")
			.setLabel("Double down")
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("blackjack_split")
			.setLabel("Split")
			.setStyle(ButtonStyle.Secondary),
	);

	const game = await blackjackInit(client, interaction.user.id, bet);
	const playerValue = calculateHandValue(game.playerCards);
	const dealerVisible = game.dealerCards[0];

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("Blackjack started")
		.setDescription(
			"- `Hit`: Take another card.\n" +
				"- `Stand`: Keep your current hand.\n" +
				"- `Double down`: Double your bet and take one more card.\n" +
				"- `Split`: Split your hand if you have two cards of the same value.",
		)
		.addFields([
			{
				name: "Your cards:",
				value: `${game.playerCards.map((card) => `<:${card.name}:${card.id}>`).join(" ")}\n\nValue: **${playerValue}**`,
				inline: true,
			},
			{
				name: "Dealer cards:",
				value: `<:${dealerVisible.name}:${dealerVisible.id}> :white_large_square:\n\nValue: **${dealerVisible.value}**`,
				inline: true,
			},
		])
		.setColor("Green")
		.setFooter({ text: `Bet: ${bet}` });

	await interaction.reply({ embeds: [embed], components: [row] });
}

export const data = new SlashCommandBuilder()
	.setName("blackjack")
	.setDescription("Blackjack.")
	.addStringOption((option) =>
		option
			.setName("bet")
			.setDescription("The amount of money you want to bet.")
			.setRequired(true),
	);
