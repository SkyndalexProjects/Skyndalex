import { SkyndalexClient } from "../classes/index.js";
import {
	ContainerBuilder,
	ContainerComponent,
	MessageComponentInteraction,
	MessageFlags,
	TextDisplayBuilder,
	TextDisplayComponent,
} from "discord.js";
import { Hand } from "../types/index.js";
import { formatToEmojis, extractCardsFromContent } from "#utils";

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

	let titleContent = "";
	let reasonContent = "";
	let embedColor = 0;

	if (userCardsCount > 21) {
		titleContent = "**You have busted!\n\n";
		reasonContent = "You exceeded 21, you lose!";
		embedColor = 0xff6666;
	} else if (userCardsCount === 21) {
		titleContent = "**Blackjack! You win!**";
		reasonContent = "You got a blackjack, you win!";
		embedColor = 0x32cd32;
	} else if (dealerCardsCount > 21) {
		titleContent = "**You win!\n\n";
		reasonContent = "Dealer busted, you win!";
		embedColor = 0x32cd32;
	} else if (userCardsCount > dealerCardsCount) {
		titleContent = "You win!";
		reasonContent = "You have more points than the dealer, you win!";
		embedColor = 0x32cd32;
	} else if (userCardsCount < dealerCardsCount) {
		titleContent = "**You lose!**\n\n";
		reasonContent = "You have less points than the dealer, you lose!";
		embedColor = 0xff6666;
	} else {
		titleContent = "It's a tie!";
		reasonContent = "You have the same points as the dealer, it's a tie!";
	}
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
	await interaction.editReply({
		flags: MessageFlags.IsComponentsV2,
		components: [container],
	});
}
