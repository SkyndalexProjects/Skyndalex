import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ContainerBuilder,
	MessageFlags,
	SeparatorBuilder,
	SlashCommandBuilder,
	TextDisplayBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "../../classes/builders/index.js";
import { getRandomCards } from "../../utils/economy/getRandomCards.js";
import type { Card, Hand } from "#types";
// Usunięto import formatToEmojis

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const bet = interaction.options.getString("bet");

	const hitButton = new ButtonBuilder()
		.setCustomId("blackjack_hit")
		.setLabel("Hit")
		.setStyle(ButtonStyle.Primary);

	const standButton = new ButtonBuilder()
		.setCustomId("blackjack_stand")
		.setLabel("Stand")
		.setStyle(ButtonStyle.Success);

	const doubleDownButton = new ButtonBuilder()
		.setCustomId("blackjack_doubledown")
		.setLabel("Double down")
		.setStyle(ButtonStyle.Secondary);

	const splitButton = new ButtonBuilder()
		.setCustomId("blackjack_split")
		.setLabel("Split")
		.setStyle(ButtonStyle.Secondary);

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		hitButton,
		standButton,
		doubleDownButton,
		splitButton,
	);

	const playerCards = await getRandomCards(client, interaction);
	const playerHand: Hand = {
		cards: playerCards,
		value: playerCards.reduce((sum, card) => sum + card.value, 0),
	};

	const dealerCards = await getRandomCards(client, interaction);
	const dealerHand: Hand = {
		cards: dealerCards,
		value: dealerCards.reduce((sum, card) => sum + card.value, 0),
	};

	console.log("Player hand:", playerHand.cards);

	const betText = new TextDisplayBuilder().setContent(`\n\n*Bet: **${bet}**`);
	const guideText = new TextDisplayBuilder().setContent(
		`- \`Hit:\` Take another card.\n` +
			`- \`Stand:\` Keep your current hand.\n` +
			`- \`Double down:\` Double your bet and take one more card.\n` +
			`- \`Split:\` Split your hand into two separate hands if you have two cards of the same value.`,
	);

	const userCardsTitle = new TextDisplayBuilder().setContent(
		`**Your cards:**\n\n`,
	);

	const userCards = new TextDisplayBuilder().setContent(
		`${playerHand.cards
			.map((card) => `<:${card.name}:${card.id}>`)
			.join(" ")}\n\nValue: **${playerHand.value}**`,
	);

	const dealerCardsTitle = new TextDisplayBuilder().setContent(
		`**Dealer cards:**\n\n`,
	);

	const dealerCardsDesc = new TextDisplayBuilder().setContent(
		`${dealerHand.cards
			.map((card) => `<:${card.name}:${card.id}>`)
			.join(" ")}\n\nValue: **${dealerHand.value}**`,
	);

	const separator = new SeparatorBuilder();
	const container = new ContainerBuilder()
		.addTextDisplayComponents(
			guideText,
			userCardsTitle,
			userCards,
			dealerCardsTitle,
			dealerCardsDesc,
		)
		.setAccentColor(0x33ccff)
		.addSeparatorComponents(separator)
		.addActionRowComponents(row)
		.addTextDisplayComponents(betText);

	await interaction.reply({
		flags: MessageFlags.IsComponentsV2,
		components: [container],
	});
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
