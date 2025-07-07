import { SkyndalexClient } from "../classes/index.js";
import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonComponent,
	ButtonStyle,
	ComponentData,
	ContainerBuilder,
	ContainerComponent,
	Embed,
	EmbedBuilder,
	MessageComponent,
	MessageComponentInteraction,
	MessageFlags,
	SeparatorBuilder,
	TextDisplayBuilder,
	TextDisplayComponent,
	TopLevelComponent,
} from "discord.js";
import { Card, Hand } from "../types/index.js";
import {
	formatToEmojis,
	extractCardsFromContent,
	getRandomCards,
} from "#utils";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	await interaction.deferUpdate();

	if (
		interaction.user.id !== interaction?.message?.interactionMetadata?.user?.id
	)
		return interaction.followUp({
			content: "Its not your button!",
			flags: 64,
		});

	const currentEmbed = interaction.message.embeds[0];
	if (!currentEmbed) return;
	const fields = currentEmbed.fields;
	const buttons = (
		interaction.message
			.components[0] as unknown as ActionRowBuilder<ButtonBuilder>
	).components;
	const playerField = fields[0];
	const dealerField = fields[1];

	const userCardsCount: number = +(
		(playerField?.value || "").match(/Value: \*\*(\d+)\*\*/)?.[1] || "0"
	);
	const dealerCardsCount: number = +(
		(dealerField?.value || "").match(/Value: \*\*(\d+)\*\*/)?.[1] || "0"
	);

	const userHand = {
		cards: await extractCardsFromContent(playerField.value),
		value: userCardsCount,
	};
	const dealerHand = {
		cards: await extractCardsFromContent(dealerField.value),
		value: dealerCardsCount,
	};
	const newCards = await getRandomCards(
		client,
		interaction,
		userHand.value,
		dealerHand.value,
	);

	userHand.cards.push(...newCards);
	userHand.value = userHand.cards.reduce((sum, card) => sum + card.value, 0);

	dealerHand.cards.push(...newCards);
	dealerHand.value = dealerHand.cards.reduce(
		(sum, card) => sum + card.value,
		0,
	);

	let titleContent = "";
	let reasonContent = "";
	let embedColor = 0;

	if (userHand.value >= 21) {
		titleContent = "**You have busted!**\n\n";
		reasonContent = "*You exceeded 21 points. You lose.*";
		embedColor = 0xff6666;
	} else if (
		dealerHand.value >= 21 ||
		userHand.value > dealerHand.value ||
		(userHand.value === 21 && dealerHand.value < 21)
	) {
		titleContent = `**You win!**\n\n`;
		reasonContent = "You win against the dealer!";
		embedColor = 0x32cd32;
		if (dealerHand.value >= 21)
			reasonContent = "Dealer passed 21 points. You win!";
		if (userHand.value === 21 && dealerHand.value < 21)
			reasonContent = "You hit 21 points! You win!";
	} else {
		titleContent = `**Your turn!**\n\n`;
		reasonContent = "You can hit, stand, double down or split.";
		embedColor = 0x3498db;

		if (userHand.value === dealerHand.value) {
			titleContent = "**Tie**";
			reasonContent = " It's a tie!";
		}
		if (dealerHand.value === 21) reasonContent = "Dealer hit 21 points!";
		if (userHand.value === 21) reasonContent = "You hit 21 points!";
	}
	const gameEnded =
		userHand.value >= 21 ||
		dealerHand.value >= 21 ||
		(userHand.value === 21 && dealerHand.value < 21);

	const embed = new EmbedBuilder()
		.setTitle(titleContent)
		.setDescription(reasonContent)
		.addFields([
			{
				name: "Your cards:",
				value: `${await formatToEmojis(userHand)}\n\nValue: **${userHand.value}**`,
				inline: true,
			},
			{
				name: "Dealer cards:",
				value: `${await formatToEmojis(dealerHand)}\n\nValue: **${dealerHand.value}**`,
				inline: true,
			},
		])
		.setColor(embedColor);

	await interaction.editReply({
		embeds: [embed],
		components: [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				buttons.map((button) => {
					const newButton = ButtonBuilder.from(
						button as unknown as ButtonComponent,
					);
					if (gameEnded) {
						return newButton.setDisabled(true);
					}
					return newButton;
				}),
			),
		],
	});
}
