type ExtractedCard = {
	id: string;
	name: string;
	value: number;
	suit: string;
};

export async function extractCardsFromContent(
	content: string,
): Promise<ExtractedCard[]> {
	const cardRegex = /<:(\w+):(\d+)>/g;
	const extractedCards: ExtractedCard[] = [];

	for (const match of content.matchAll(cardRegex)) {
		const cardName = match[1];
		const cardId = match[2];

		const getValue = (name: string): number => {
			if (name.includes("A")) {
				return 11;
			}

			if (
				name.includes("J") ||
				name.includes("Q") ||
				name.includes("K")
			) {
				return 10;
			}

			return Number.parseInt(name.replace(/\D/g, ""), 10);
		};

		const getSuit = (name: string): string => {
			if (name.includes("spade")) return "spade";
			if (name.includes("heart")) return "heart";
			if (name.includes("diamond")) return "diamond";

			return "club";
		};

		extractedCards.push({
			id: cardId,
			name: cardName,
			value: getValue(cardName),
			suit: getSuit(cardName),
		});
	}

	return extractedCards;
}