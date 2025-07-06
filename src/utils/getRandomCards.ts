import type {
	ChatInputCommandInteraction,
	MessageComponentInteraction,
	ModalSubmitInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../classes/index.js";
import { Card } from "../types/index.js";
import * as console from "node:console";

interface EmojiData {
	id: string;
	name: string;
	user?: any;
	roles?: string[];
	require_colons?: boolean;
	managed?: boolean;
	animated?: boolean;
	available?: boolean;
}

interface EmojiResponse {
	items: EmojiData[];
}

export async function getRandomCards(
	client: SkyndalexClient,
	interaction:
		| ChatInputCommandInteraction
		| ModalSubmitInteraction
		| MessageComponentInteraction,
	dealerCardsValue?: number,
	userCardsValue?: number,
): Promise<Card[]> {
	const rawEmojiList = await fetch(
		`https://discord.com/api/v10/applications/${client.user?.id}/emojis`,
		{
			headers: { Authorization: `Bot ${client.token}` },
		},
	);
	const emojiList = (await rawEmojiList.json()) as EmojiResponse;

	let emojis: EmojiData[] = [];

	for (const emoji of emojiList.items) {
		if (
			["spade", "heart", "diamond", "club"].some((keyword) =>
				emoji.name.includes(keyword),
			)
		) {
			emojis.push({
				id: emoji.id,
				name: emoji.name,
			});
		}
	}

	const mapValues = emojis.map((emoji) => {
		let value: number;
		const numberMatch = emoji.name.match(/\d+/);
		if (numberMatch) {
			value = parseInt(numberMatch[0]);
		} else if (emoji.name.includes("A")) {
			value = 11; // Zmieniono z 1 na 11 dla spójności
		} else if (
			emoji.name.includes("J") ||
			emoji.name.includes("Q") ||
			emoji.name.includes("K")
		) {
			value = 10;
		} else {
			value = 0;
		}

		return {
			id: emoji.id,
			name: emoji.name,
			value: value,
			suit: emoji.name.includes("spade")
				? "spade"
				: emoji.name.includes("heart")
					? "heart"
					: emoji.name.includes("diamond")
						? "diamond"
						: "club",
		};
	});

	const selectedCards: Card[] = [];
	const availableCards = [...mapValues];

	if (userCardsValue !== undefined || dealerCardsValue !== undefined) {
		if (userCardsValue !== undefined) {
			let targetValue = 21 - userCardsValue;

			const suitableCards = availableCards.filter(
				(card) => card.value <= targetValue,
			);

			if (suitableCards.length > 0) {
				const randomIndex = Math.floor(Math.random() * suitableCards.length);
				selectedCards.push(suitableCards[randomIndex]);
			} else {
				const randomIndex = Math.floor(Math.random() * availableCards.length);
				selectedCards.push(availableCards[randomIndex]);
			}

			return selectedCards;
		}

		if (dealerCardsValue !== undefined) {
			while (dealerCardsValue < 17 && availableCards.length > 0) {
				const randomIndex = Math.floor(Math.random() * availableCards.length);
				const card = availableCards[randomIndex];

				selectedCards.push(card);
				dealerCardsValue += card.value;
				availableCards.splice(randomIndex, 1);
			}

			return selectedCards;
		}
	}

	let currentSum = 0;
	const minCards = 2;
	const maxCards = 5;

	for (let i = 0; i < minCards && availableCards.length > 0; i++) {
		const randomIndex = Math.floor(Math.random() * availableCards.length);
		const card = availableCards[randomIndex];
		selectedCards.push(card);
		currentSum += card.value;
		availableCards.splice(randomIndex, 1);
	}

	while (
		currentSum < 4 &&
		selectedCards.length < maxCards &&
		availableCards.length > 0
	) {
		const randomIndex = Math.floor(Math.random() * availableCards.length);
		const card = availableCards[randomIndex];

		if (currentSum + card.value <= 21) {
			selectedCards.push(card);
			currentSum += card.value;
		}
		availableCards.splice(randomIndex, 1);
	}

	return selectedCards;
}
