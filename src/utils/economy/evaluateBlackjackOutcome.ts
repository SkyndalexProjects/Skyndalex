const colors = {
	win: 0x32cd32,
	lose: 0xff6666,
	tie: 0x3498db,
	ongoing: 0xffa500,
};
const result = {
	titleContent: "**Tie**",
	reasonContent: "It's a tie!",
	embedColor: colors.tie,
	status: 0,
};
export function evaluateBlackjackOutcome(
	userValue: number,
	dealerValue: number,
) {
	if (userValue > 21) {
		result.titleContent = "**You have busted!**\n\n";
		result.reasonContent = "*You exceeded 21 points. You lose.*";
		result.embedColor = colors.lose;
		result.status = 2;
	} else if (dealerValue > 21) {
		result.titleContent = "**You win!**\n\n";
		result.reasonContent = "Dealer passed 21 points. You win!";
		result.embedColor = colors.win;
		result.status = 1;
	} else if (userValue > dealerValue) {
		result.titleContent = "**You win!**\n\n";
		result.reasonContent = "You have more points than the dealer!";
		result.embedColor = colors.win;
		result.status = 1;
	} else if (dealerValue > userValue) {
		result.titleContent = "**Dealer wins!**\n\n";
		result.reasonContent = "Dealer has more points than you!";
		result.embedColor = colors.lose;
		result.status = 2;
	}

	return result;
}
