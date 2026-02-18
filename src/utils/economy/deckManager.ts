import type { SkyndalexClient } from "#classes";
import type { BlackjackState, Card, Hand } from "#types";

export async function buildDeck(client: SkyndalexClient): Promise<Card[]> {
	const rawEmojiList = await fetch(
		`https://discord.com/api/v10/applications/${client.user?.id}/emojis`,
		{ headers: { Authorization: `Bot ${client.token}` } },
	);
	const emojiList = (await rawEmojiList.json()) as {
		items: { id: string; name: string }[];
	};

	const emojis = emojiList.items.filter((emoji) =>
		["spade", "heart", "diamond", "club"].some((keyword) =>
			emoji.name.includes(keyword),
		),
	);

	const availableCards: Card[] = emojis
		.map((emoji) => {
			const nameParts = emoji.name.match(/([a-z]+)([2-9]|10|A|J|Q|K)$/i);
			if (!nameParts) return null;

			const suitName = nameParts[1].toLowerCase();
			const rank = nameParts[2];

			let value = 0;
			if (rank === "A") value = 11;
			else if (["J", "Q", "K"].includes(rank)) value = 10;
			else value = parseInt(rank);

			return {
				id: emoji.id,
				name: emoji.name,
				value,
				suit: suitName,
				visible: true,
			};
		})
		.filter(Boolean) as Card[];

	const decks = 6;
	const deck: Card[] = [];
	for (let i = 0; i < decks; i++) deck.push(...structuredClone(availableCards));
	return deck;
}

export function pickRandomCard(deck: Card[]): Card {
	const index = Math.floor(Math.random() * deck.length);
	return deck.splice(index, 1)[0];
}

export function calculateHandValue(cards: Card[]): number {
	let value = 0;
	let aces = 0;
	for (const card of cards) {
		value += card.value;
		if (card.value === 11) aces += 1;
	}
	return value;
}

export async function blackjackInit(
	client: SkyndalexClient,
	userId: string,
	bet: number,
): Promise<BlackjackState> {
	const deck = await buildDeck(client);
	const playerCards: Card[] = [pickRandomCard(deck), pickRandomCard(deck)];
	const dealerCards: Card[] = [
		{ ...pickRandomCard(deck), visible: true },
		{ ...pickRandomCard(deck), visible: false },
	];
	const game: BlackjackState = { deck, playerCards, dealerCards, bet };
	client.blackjackGames.set(userId, game);
	return game;
}

export function hit(client: SkyndalexClient, userId: string): Hand | null {
	const game = client.blackjackGames.get(userId);
	if (!game) return null;
	const newCard = pickRandomCard(game.deck);
	// console.log("HIT FUNCTION Picking ranodom card", newCard)
	game.playerCards.push(newCard);
	return {
		cards: game.playerCards,
		value: calculateHandValue(game.playerCards),
	};
}
