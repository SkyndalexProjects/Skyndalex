import {
	type ChatInputCommandInteraction,
	ContainerBuilder,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	SlashCommandBuilder,
	TextDisplayBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "#builders";

const symbols = [
	{ emoji: "🍒", weight: 30, multiplier: 2, name: "Cherry" },
	{ emoji: "🍋", weight: 25, multiplier: 3, name: "Lemon" },
	{ emoji: "🍊", weight: 20, multiplier: 4, name: "Orange" },
	{ emoji: "🍇", weight: 15, multiplier: 5, name: "Grapes" },
	{ emoji: "🔔", weight: 7, multiplier: 10, name: "Bell" },
	{ emoji: "💎", weight: 2, multiplier: 25, name: "Diamond" },
	{ emoji: "7️⃣", weight: 1, multiplier: 50, name: "Seven" },
];

const winLines = [
	[
		[0, 0],
		[0, 1],
		[0, 2],
	],
	[
		[1, 0],
		[1, 1],
		[1, 2],
	],
	[
		[2, 0],
		[2, 1],
		[2, 2],
	],
	[
		[0, 0],
		[1, 0],
		[2, 0],
	],
	[
		[0, 1],
		[1, 1],
		[2, 1],
	],
	[
		[0, 2],
		[1, 2],
		[2, 2],
	],

	[
		[0, 0],
		[1, 1],
		[2, 2],
	],
	[
		[0, 2],
		[1, 1],
		[2, 0],
	],
];

function getRandomSymbol(): (typeof symbols)[0] {
	const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
	let random = Math.random() * totalWeight;

	for (const symbol of symbols) {
		random -= symbol.weight;
		if (random <= 0) return symbol;
	}
	return symbols[0];
}

function generateGrid(): (typeof symbols)[0][][] {
	return Array.from({ length: 3 }, () =>
		Array.from({ length: 3 }, () => getRandomSymbol()),
	);
}

function checkWinLines(grid: (typeof symbols)[0][][]): {
	wins: { line: string; symbol: (typeof symbols)[0] }[];
	totalMultiplier: number;
} {
	const wins: { line: string; symbol: (typeof symbols)[0] }[] = [];
	let totalMultiplier = 0;

	const lineNames = [
		"Top Row",
		"Middle Row",
		"Bottom Row",
		"Left Column",
		"Middle Column",
		"Right Column",
		"Diagonal ↘",
		"Diagonal ↗",
	];

	for (let i = 0; i < winLines.length; i++) {
		const line = winLines[i];
		const symbols = line.map(([row, col]) => grid[row][col]);

		if (
			symbols[0].emoji === symbols[1].emoji &&
			symbols[1].emoji === symbols[2].emoji
		) {
			wins.push({ line: lineNames[i], symbol: symbols[0] });
			totalMultiplier += symbols[0].multiplier;
		}
	}

	return { wins, totalMultiplier };
}

function formatGrid(grid: (typeof symbols)[0][][]): string {
	return grid
		.map((row) => `║ ${row.map((s) => s.emoji).join(" │ ")} ║`)
		.join("\n╠═══╪═══╪═══╣\n");
}

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const bet = Number(interaction.options.getString("bet") || "0");

	if (bet <= 0) {
		const embed = new EmbedBuilder(client, interaction.locale)
			.setRawDescription("❌ Please enter a valid bet amount greater than 0!")
			.setColor("Red");
		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	const grid = generateGrid();

	const { wins, totalMultiplier } = checkWinLines(grid);

	const winnings = wins.length > 0 ? bet * totalMultiplier : 0;
	const profit = winnings - bet;
	const isWin = wins.length > 0;

	const slotDisplay = ["╔═══╤═══╤═══╗", formatGrid(grid), "╚═══╧═══╧═══╝"].join(
		"\n",
	);

	const separator = new SeparatorBuilder().setSpacing(
		SeparatorSpacingSize.Large,
	);

	let descriptionContent = `**🎰 SlotMachine 🎰**\n\n\`\`\`\n${slotDisplay}\n\`\`\`\n\n`;

	if (isWin) {
		descriptionContent += "🎉 **WINNER!** 🎉\n\n";
		descriptionContent += "**Winning Lines:**\n";
		for (const win of wins) {
			descriptionContent += `• ${win.line}: ${win.symbol.emoji} ${win.symbol.name} (x${win.symbol.multiplier})\n`;
		}
		descriptionContent += `\n💰 **Bet:** ${bet}\n`;
		descriptionContent += `💵 **Winnings:** ${winnings}\n`;
		descriptionContent += `📈 **Profit:** +${profit}`;
	} else {
		descriptionContent += "❌ **No matches this time...**\n\n";
		descriptionContent += `💰 **Bet:** ${bet}\n`;
		descriptionContent += `📉 **Lost:** -${bet}`;
	}

	const description = new TextDisplayBuilder().setContent(descriptionContent);
	const footer = new TextDisplayBuilder().setContent(
		"-# Win chance: ~30%  Best payout: 7️⃣ x50",
	);

	const container = new ContainerBuilder()
		.addTextDisplayComponents(description)
		.addSeparatorComponents(separator)
		.addTextDisplayComponents(footer)
		.setAccentColor(isWin ? 0xffd700 : 0xff0000);
	await interaction.reply({
		flags: MessageFlags.IsComponentsV2,
		components: [container],
	});
}

export const data = new SlashCommandBuilder()
	.setName("slot-machine")
	.setDescription("Spin the slot machine and try your luck!")
	.addStringOption((option) =>
		option
			.setName("bet")
			.setDescription("The amount of money you want to bet.")
			.setRequired(true),
	);
