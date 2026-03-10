import {
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	ContainerBuilder,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	SlashCommandBuilder,
	TextDisplayBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
//TODO: remove multipliers (or make them better)

const RED_NUMBERS = [
	1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];
const BLACK_NUMBERS = [
	2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
];

const ROULETTE_SPACES = [
	{ name: "0 (Green)", value: "0" },
	...Array.from({ length: 36 }, (_, i) => {
		const num = i + 1;
		const color = RED_NUMBERS.includes(num) ? "Red" : "Black";
		return { name: `${num} (${color})`, value: String(num) };
	}),
	{ name: "Red (pays 2:1)", value: "red" },
	{ name: "Black (pays 2:1)", value: "black" },
	{ name: "Odd (pays 2:1)", value: "odd" },
	{ name: "Even (pays 2:1)", value: "even" },
	{ name: "1-18 Low (pays 2:1)", value: "low" },
	{ name: "19-36 High (pays 2:1)", value: "high" },
	{ name: "1st Dozen 1-12 (pays 3:1)", value: "1st12" },
	{ name: "2nd Dozen 13-24 (pays 3:1)", value: "2nd12" },
	{ name: "3rd Dozen 25-36 (pays 3:1)", value: "3rd12" },
	{ name: "1st Column (pays 3:1)", value: "col1" },
	{ name: "2nd Column (pays 3:1)", value: "col2" },
	{ name: "3rd Column (pays 3:1)", value: "col3" },
];

const activeGames = new Map<
	string,
	{
		players: Map<string, { bet: number; space: string; username: string }>;
		endTime: number;
		messageId: string;
	}
>();

function checkWin(
	space: string,
	result: number,
): { won: boolean; multiplier: number } {
	let won = false;
	let multiplier = 0;

	if (!isNaN(Number(space)) && Number(space) >= 0 && Number(space) <= 36) {
		if (Number(space) === result) {
			won = true;
			multiplier = 36;
		}
	} else {
		switch (space) {
			case "red":
				won = RED_NUMBERS.includes(result);
				multiplier = 2;
				break;
			case "black":
				won = BLACK_NUMBERS.includes(result);
				multiplier = 2;
				break;
			case "odd":
				won = result !== 0 && result % 2 === 1;
				multiplier = 2;
				break;
			case "even":
				won = result !== 0 && result % 2 === 0;
				multiplier = 2;
				break;
			case "low":
				won = result >= 1 && result <= 18;
				multiplier = 2;
				break;
			case "high":
				won = result >= 19 && result <= 36;
				multiplier = 2;
				break;
			case "1st12":
				won = result >= 1 && result <= 12;
				multiplier = 3;
				break;
			case "2nd12":
				won = result >= 13 && result <= 24;
				multiplier = 3;
				break;
			case "3rd12":
				won = result >= 25 && result <= 36;
				multiplier = 3;
				break;
			case "col1":
				won = result !== 0 && result % 3 === 1;
				multiplier = 3;
				break;
			case "col2":
				won = result !== 0 && result % 3 === 2;
				multiplier = 3;
				break;
			case "col3":
				won = result !== 0 && result % 3 === 0;
				multiplier = 3;
				break;
		}
	}

	return { won, multiplier };
}

function buildBettingContainer(
	timeRemaining: number,
	players: Map<string, { bet: number; space: string; username: string }>,
): ContainerBuilder {
	const separator = new SeparatorBuilder().setSpacing(
		SeparatorSpacingSize.Large,
	);
	const acceptingBets = new TextDisplayBuilder().setContent(
		":slot_machine: | **Accepting bets!**",
	);
	const timeRemainingText = new TextDisplayBuilder().setContent(
		`⏰ ${timeRemaining} seconds`,
	);
	const playersHeader = new TextDisplayBuilder().setContent("👥 | **Players**");
	const playersList = new TextDisplayBuilder().setContent(
		players.size === 0
			? "No players yet"
			: Array.from(players.values())
					.map((p) => `- **${p.username}** - ${p.bet} on **${p.space}**`)
					.join("\n"),
	);
	const footer = new TextDisplayBuilder().setContent(
		"-# Use /roulette to join!",
	);

	return new ContainerBuilder()
		.addTextDisplayComponents(acceptingBets, timeRemainingText)
		.addSeparatorComponents(separator)
		.addTextDisplayComponents(playersHeader, playersList)
		.addTextDisplayComponents(footer)
		.setAccentColor(0xffff00);
}

function buildResultsContainer(
	result: number,
	resultColor: string,
	resultEmoji: string,
	winners: string[],
	losers: string[],
	playerCount: number,
): ContainerBuilder {
	const separator = new SeparatorBuilder().setSpacing(
		SeparatorSpacingSize.Large,
	);
	const title = new TextDisplayBuilder().setContent(
		":slot_machine: | **Roulette Results!**",
	);
	const resultText = new TextDisplayBuilder().setContent(
		`**The ball landed on: **${result}** (${resultColor})**`,
	);

	const resultsContent: string[] = [];
	if (winners.length > 0) {
		resultsContent.push(`**Winners:**\n${winners.join("\n")}`);
	}
	if (losers.length > 0) {
		resultsContent.push(`**Losers:**\n${losers.join("\n")}`);
	}

	const resultsText = new TextDisplayBuilder().setContent(
		resultsContent.join("\n\n") || "No results",
	);
	const footer = new TextDisplayBuilder().setContent(
		`-# ${playerCount} player(s) participated`,
	);

	const accentColor = winners.length > 0 ? 0x00ff00 : 0xff0000;

	return new ContainerBuilder()
		.addTextDisplayComponents(title, resultText)
		.addSeparatorComponents(separator)
		.addTextDisplayComponents(resultsText)
		.addTextDisplayComponents(footer)
		.setAccentColor(accentColor);
}

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const bet = Number(interaction.options.getString("bet") || "0");
	const space = interaction.options.getString("space") || "0";
	const channelId = interaction.channelId;
	const userId = interaction.user.id;
	const username = interaction.user.username;

	const existingGame = activeGames.get(channelId);

	if (existingGame) {
		if (existingGame.players.has(userId)) {
			const previousBet = existingGame.players.get(userId)!.bet;
			await client.economy.setMoney(client, userId, previousBet);
			await client.economy.setMoney(client, userId, -bet);

			existingGame.players.set(userId, { bet, space, username });
			await interaction.reply({
				content: `✅ Updated your bet to **${bet}** on **${space}**!`,
				ephemeral: true,
			});
		} else {
			await client.economy.setMoney(client, userId, -bet);

			existingGame.players.set(userId, { bet, space, username });
			await interaction.reply({
				content: `✅ You joined the roulette! Bet: **${bet}** on **${space}**`,
				ephemeral: true,
			});
		}

		const timeLeft = Math.ceil((existingGame.endTime - Date.now()) / 1000);
		const container = buildBettingContainer(timeLeft, existingGame.players);

		const message = await interaction.channel?.messages.fetch(
			existingGame.messageId,
		);
		if (message) {
			await message.edit({
				components: [container],
				flags: MessageFlags.IsComponentsV2,
			});
		}
		return;
	}

	await client.economy.setMoney(client, userId, -bet);

	const endTime = Date.now() + 15000;
	const players = new Map<
		string,
		{ bet: number; space: string; username: string }
	>();
	players.set(userId, { bet, space, username });

	const startContainer = buildBettingContainer(15, players);

	const reply = await interaction.reply({
		components: [startContainer],
		flags: MessageFlags.IsComponentsV2,
	});

	activeGames.set(channelId, {
		players,
		endTime,
		messageId: reply.id,
	});

	const countdownIntervals = [10, 5];
	for (const seconds of countdownIntervals) {
		setTimeout(
			async () => {
				const game = activeGames.get(channelId);
				if (!game) return;

				const countdownContainer = buildBettingContainer(seconds, game.players);

				await reply.edit({
					components: [countdownContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			},
			(15 - seconds) * 1000,
		);
	}

	setTimeout(async () => {
		const game = activeGames.get(channelId);
		if (!game) return;

		activeGames.delete(channelId);

		const result = Math.floor(Math.random() * 37);
		const resultColor =
			result === 0 ? "green" : RED_NUMBERS.includes(result) ? "red" : "black";
		const resultEmoji =
			resultColor === "red" ? "🔴" : resultColor === "black" ? "⚫" : "🟢";

		const winners: string[] = [];
		const losers: string[] = [];

		for (const [_playerId, playerData] of game.players) {
			const { won, multiplier } = checkWin(playerData.space, result);
			const winnings = won ? playerData.bet * multiplier : 0;

			if (won) {
				await client.economy.setMoney(client, _playerId, winnings);
				winners.push(
					`✅ **${playerData.username}** won **${winnings}** (bet ${playerData.bet} on ${playerData.space})`,
				);
			} else {
				losers.push(
					`❌ **${playerData.username}** lost **${playerData.bet}** (bet on ${playerData.space})`,
				);
			}
		}

		const resultsContainer = buildResultsContainer(
			result,
			resultColor,
			resultEmoji,
			winners,
			losers,
			game.players.size,
		);

		try {
			await reply.edit({
				components: [resultsContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (e) {
			if (interaction.channel?.isSendable()) {
				await interaction.channel.send({
					components: [resultsContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}
	}, 15000);
}

export const data = new SlashCommandBuilder()
	.setName("roulette")
	.setDescription("Roulette.")
	.addStringOption((option) =>
		option
			.setName("bet")
			.setDescription("The amount of money you want to bet.")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("space")
			.setDescription("The space you want to bet on.")
			.setRequired(true)
			.setAutocomplete(true),
	);

export async function autocomplete(interaction: AutocompleteInteraction) {
	const focusedValue = interaction.options.getFocused().toLowerCase();

	const filtered = ROULETTE_SPACES.filter(
		(space) =>
			space.name.toLowerCase().includes(focusedValue) ||
			space.value.toLowerCase().includes(focusedValue),
	).slice(0, 25);

	await interaction.respond(filtered);
}
