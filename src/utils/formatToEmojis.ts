import { type Card, Hand } from "../types/index.js";

export async function formatToEmojis(hand: Hand): Promise<string> {
	return hand.cards.map((card: Card) => `<:${card.name}:${card.id}>`).join(" ");
}
