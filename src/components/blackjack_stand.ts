import {
	type ActionRow,
	ActionRowBuilder,
	ButtonBuilder,
	type ButtonComponent,
	EmbedBuilder,
	type MessageComponentInteraction,
} from "discord.js";
import {
	calculateHandValue,
	evaluateBlackjackOutcome,
	pickRandomCard,
} from "#utils";
import type { SkyndalexClient } from "../classes/index.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	await interaction.deferUpdate();

	const game = client.blackjackGames.get(interaction.user.id);

	if (!game)
		return interaction.followUp({
			content: "No active game found.",
			flags: 64,
		});

	for (const card of game.dealerCards) {
		card.visible = true;
	}

	let dealerValue = calculateHandValue(game.dealerCards);

	while (dealerValue < 17) {
		const newCard = pickRandomCard(game.deck);
		game.dealerCards.push(newCard);
		dealerValue = calculateHandValue(game.dealerCards);
	}

	const playerValue = calculateHandValue(game.playerCards);

	const { titleContent, reasonContent, embedColor } = evaluateBlackjackOutcome(
		playerValue,
		dealerValue,
	);

	client.blackjackGames.delete(interaction.user.id);

	const embed = new EmbedBuilder()
		.setTitle(titleContent)
		.setDescription(reasonContent)
		.addFields([
			{
				name: "Your cards:",
				value: `${game.playerCards
					.map((card) => `<:${card.name}:${card.id}>`)
					.join(" ")}\n\nValue: **${playerValue}**`,
				inline: true,
			},
			{
				name: "Dealer cards:",
				value: `${game.dealerCards
					.map((card) => `<:${card.name}:${card.id}>`)
					.join(" ")}\n\nValue: **${dealerValue}**`,
				inline: true,
			},
		])
		.setColor(embedColor);

	const actionRow = interaction.message
		.components[0] as ActionRow<ButtonComponent>;
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		...actionRow.components.map((b) => {
			const button = ButtonBuilder.from(b);
			button.setDisabled(true);
			return button;
		}),
	);

	await interaction.editReply({ embeds: [embed], components: [row] });
}
