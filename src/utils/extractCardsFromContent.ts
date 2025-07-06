export async function extractCardsFromContent(content: string) {
	console.log("extractCardsFromContent called with content:", content);
	const cardRegex = /<:(\w+):(\d+)>/g;
	const extractedCards: {
		id: string;
		name: string;
		value: number;
		suit: string;
	}[] = [];
	let match;
	while ((match = cardRegex.exec(content)) !== null) {
		const cardName = match[1];
		const cardId = match[2];
		let value: number;

		console.log("cardName:", cardName);
		if (cardName.includes("A")) {
			value = 11; // Ace
		} else if (["J", "Q", "K"].includes(cardName)) {
			value = 10;
		} else {
			value = parseInt(cardName.replace(/\D/g, ""), 10);
		}

		const getSuit = (cardName: string): string => {
			if (cardName.includes("A")) {
				value = 11;
			} else if (
				cardName.includes("J") ||
				cardName.includes("Q") ||
				cardName.includes("K")
			) {
				value = 10;
			} else {
				value = parseInt(cardName.replace(/\D/g, ""), 10);
			}
			if (cardName.includes("spade")) return "spade";
			if (cardName.includes("heart")) return "heart";
			if (cardName.includes("diamond")) return "diamond";
			return "club";
		};

		const suit = getSuit(cardName);
		extractedCards.push({ id: cardId, name: cardName, value, suit });
	}

	return extractedCards;
}
