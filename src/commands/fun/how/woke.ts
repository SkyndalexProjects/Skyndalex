import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../../classes/index.js";

interface WokeDetectorResponse {
	found: boolean;
	error: boolean;
	info: { name: string; avatar: string };
	games: {
		count: {
			all: number;
			counted: number;
			woke: number;
			slightly_woke: number;
			not_woke: number;
		};
		playtime: {
			all: number;
			counted: number;
			woke: number;
			slightly_woke: number;
			not_woke: number;
		};
		list: Array<{
			playtime: number;
			appid: string;
			name: string;
			banner: string;
			woke: string;
			description: string;
			review_link: string;
		}>;
	};
	lastUpdate: string;
}
interface RootIndexMap {
	found: number;
	error: number;
	info: number;
	games: number;
	lastUpdate: number;
}

interface InfoIndexMap {
	name: number;
	avatar: number;
}

interface GamesIndexMap {
	count: number;
	playtime: number;
	list: number;
}

interface CountIndexMap {
	all: number;
	counted: number;
	woke: number;
	slightly_woke: number;
	not_woke: number;
}

interface PlaytimeIndexMap {
	all: number;
	counted: number;
	woke: number;
	slightly_woke: number;
	not_woke: number;
}

interface GameItemIndexMap {
	playtime: number;
	appid: number;
	name: number;
	banner: number;
	woke: number;
	description: number;
	review_link: number;
}

type SvelteKitDataArray = (
	| RootIndexMap
	| InfoIndexMap
	| GamesIndexMap
	| CountIndexMap
	| PlaytimeIndexMap
	| GameItemIndexMap
	| number[]
	| string
	| number
	| boolean
)[];

interface nodesJSON {
	type: string;
	nodes: [{ type: "skip" }, { type: "data"; data: unknown[]; uses: object }];
}
function parseWokeData(json: nodesJSON): WokeDetectorResponse | null {
	const dataNode = json.nodes?.find(
		(n): n is { type: "data"; data: unknown[]; uses: object } =>
			n.type === "data" && "data" in n,
	);
	if (!dataNode) return null;

	const d: SvelteKitDataArray = dataNode.data as SvelteKitDataArray;
	console.log("dededede", d);
	const root = d[0] as RootIndexMap;
	const info = d[root.info] as InfoIndexMap;
	const games = d[root.games] as GamesIndexMap;
	const count = d[games.count] as CountIndexMap;
	const playtime = d[games.playtime] as PlaytimeIndexMap;
	const listIndices = d[games.list] as number[];

	return {
		found: d[root.found] as boolean,
		error: d[root.error] as boolean,
		info: {
			name: d[info.name] as string,
			avatar: d[info.avatar] as string,
		},
		games: {
			count: {
				all: d[count.all] as number,
				counted: d[count.counted] as number,
				woke: d[count.woke] as number,
				slightly_woke: d[count.slightly_woke] as number,
				not_woke: d[count.not_woke] as number,
			},
			playtime: {
				all: d[playtime.all] as number,
				counted: d[playtime.counted] as number,
				woke: d[playtime.woke] as number,
				slightly_woke: d[playtime.slightly_woke] as number,
				not_woke: d[playtime.not_woke] as number,
			},
			list: listIndices.map((idx: number) => {
				const game = d[idx] as GameItemIndexMap;
				return {
					playtime: d[game.playtime] as number,
					appid: d[game.appid] as string,
					name: d[game.name] as string,
					banner: d[game.banner] as string,
					woke: d[game.woke] as string,
					description: d[game.description] as string,
					review_link: d[game.review_link] as string,
				};
			}),
		},
		lastUpdate: d[root.lastUpdate] as string,
	};
}

function getWokeLevel(count: {
	woke: number;
	slightly_woke: number;
	not_woke: number;
	counted: number;
}): string {
	const wokePercent =
		((count.woke + count.slightly_woke * 0.5) / count.counted) * 100;
	if (wokePercent >= 50) return "🔴 Highly Woke";
	if (wokePercent >= 25) return "🟠 Moderately Woke";
	if (wokePercent >= 10) return "🟡 Slightly Woke";
	return "🟢 Based";
}

export async function run(
	_client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const steamid = interaction.options.getString("steamid");

	const response = await fetch(
		`https://wokedetector.cirnoslab.me/${steamid}/__data.json?x-sveltekit-invalidated=01`,
	);
	const json = await response.json();
	const data = parseWokeData(json as nodesJSON);

	if (!data || data.error || !data.found) {
		return interaction.reply({
			content: "❌ User not found or error occurred.",
			ephemeral: true,
		});
	}

	const { count } = data.games;
	const unknown = count.all - count.counted;

	// TODO: Components v2

	const embed = new EmbedBuilder()
		.setTitle(`Woke Detector - ${data.info.name}`)
		.setThumbnail(data.info.avatar)
		.setColor(count.woke > count.not_woke ? 0xff0000 : 0x00ff00)
		.addFields(
			{ name: "📊 Woke Level", value: getWokeLevel(count), inline: false },
			{ name: "🎮 Total Games", value: `${count.all}`, inline: true },
			{ name: "🔴 Woke", value: `${count.woke}`, inline: true },
			{
				name: "🟠 Slightly Woke",
				value: `${count.slightly_woke}`,
				inline: true,
			},
			{ name: "🟢 Not Woke", value: `${count.not_woke}`, inline: true },
			{ name: "❓ Unknown", value: `${unknown}`, inline: true },
		)
		.setFooter({
			text: `Last updated: ${new Date(data.lastUpdate).toLocaleDateString()}`,
		});

	return interaction.reply({ embeds: [embed] });
}

export const data = new SlashCommandSubcommandBuilder()
	.setName("woke")
	.setDescription("Detect woke user")
	.addStringOption((option) =>
		option.setName("steamid").setDescription("User steamid.").setRequired(true),
	);
