import { SkyndalexClient } from "../classes/index.js";
import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	ContainerComponent,
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

	const messageComponents: ContainerComponent = interaction.message
		.components[0] as ContainerComponent;

	const userCardsCount: number = +(
		(
			(messageComponents?.components[2] as TextDisplayComponent)?.data
				?.content || ""
		).match(/Value: \*\*(\d+)\*\*/)?.[1] || "0"
	);

	const dealerCardsCount: number = +(
		(
			(messageComponents?.components[4] as TextDisplayComponent)?.data
				?.content || ""
		).match(/Value: \*\*(\d+)\*\*/)?.[1] || "0"
	);

	const userHand: Hand = {
		cards: await extractCardsFromContent(
			(messageComponents.components[2] as TextDisplayComponent)?.data?.content,
		),
		value: userCardsCount,
	};
	const dealerHand: Hand = {
		cards: await extractCardsFromContent(
			(messageComponents.components[4] as TextDisplayComponent)?.data?.content,
		),
		value: dealerCardsCount,
	};

	const newCards = await getRandomCards(
		client,
		interaction,
		userHand.value,
		dealerHand.value,
	);

	console.log("Hit user hand:", userHand);
	console.log("new cards:", newCards);
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
	const title = new TextDisplayBuilder().setContent(titleContent);
	const reason = new TextDisplayBuilder().setContent(reasonContent);
	const userCards = new TextDisplayBuilder().setContent(
		`${await formatToEmojis(userHand)}\n\nValue: **${userHand.value}**`,
	);
	const dealerCards = new TextDisplayBuilder().setContent(
		`${await formatToEmojis(dealerHand)}\n\nValue: **${dealerHand.value}**`,
	);
	const userCardsTitle = new TextDisplayBuilder().setContent(
		`**Your cards:**\n\n`,
	);
	const dealerCardsTitle = new TextDisplayBuilder().setContent(
		`**Dealer cards:**\n\n`,
	);

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

	const gameEnded =
		userHand.value >= 21 ||
		dealerHand.value >= 21 ||
		(userHand.value === 21 && dealerHand.value < 21);

	console.log("Did game end?", gameEnded);
	const container = new ContainerBuilder()
		.addTextDisplayComponents(title)
		.addTextDisplayComponents(reason)
		.addTextDisplayComponents(
			userCardsTitle,
			userCards,
			dealerCardsTitle,
			dealerCards,
		)
		.setAccentColor(embedColor);
	if (!gameEnded) {
		container.addActionRowComponents(row);
	}
	await interaction.editReply({
		flags: MessageFlags.IsComponentsV2,
		components: [container],
	});

}
