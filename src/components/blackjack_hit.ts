import { SkyndalexClient } from "../classes/index.js";
import {
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
	MessageComponentInteraction,
	type ActionRow,
	type ButtonComponent,
} from "discord.js";
import { hit, calculateHandValue, evaluateBlackjackOutcome } from "#utils";

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

	const playerHand = hit(client, interaction.user.id);
	if (!playerHand) return;

	const dealerHand = game.dealerCards;
	const dealerValue = calculateHandValue(
		dealerHand.filter((card) => card.visible),
	);

	// console.log("HIT playerHand", playerHand)

	let titleContent = "";
	let reasonContent = "";
	let embedColor = 0x000000;
	let status = 0;

	if (playerHand.value > 21) {
		const outcome = evaluateBlackjackOutcome(playerHand.value, dealerValue);

		titleContent = outcome.titleContent;
		reasonContent = outcome.reasonContent;
		embedColor = outcome.embedColor;
		status = outcome.status;
	} else {
		titleContent = interaction.message.embeds[0]?.title ?? "";
		reasonContent = interaction.message.embeds[0]?.description ?? "";
		embedColor = interaction.message.embeds[0]?.color ?? 0xffa500;
		status = 0;
	}

	const gameEnded = status !== 0;

	if (gameEnded) {
		// console.log("GAME ENDED SUCCESSFULLY");
		client.blackjackGames.delete(interaction.user.id);
	}

	const embed = new EmbedBuilder()
		.setTitle(titleContent)
		.setDescription(reasonContent)
		.addFields([
			{
				name: "Your cards:",
				value: `${playerHand.cards
					.map((card) => `<:${card.name}:${card.id}>`)
					.join(" ")}\n\nValue: **${playerHand.value}**`,
				inline: true,
			},
			{
				name: "Dealer cards:",
				value: `${dealerHand
					.map((card) => (card.visible ? `<:${card.name}:${card.id}>` : "🂠"))
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
			if (gameEnded) button.setDisabled(true);
			return button;
		}),
	);

	await interaction.editReply({ embeds: [embed], components: [row] });
}
