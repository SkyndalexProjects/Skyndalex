import type {
	Interaction,
	MessageComponentInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../classes/Client";

export interface Command {
	data: SlashCommandBuilder;
	run: (client: SkyndalexClient, interaction: Interaction) => Promise<void>;
	autocomplete: (interaction: Interaction) => Promise<void>;
}
export interface Component {
	customId: string;
	run: (
		client: SkyndalexClient,
		interaction: MessageComponentInteraction,
	) => Promise<void>;
}
export interface radioStation {
	hits: {
		hits: [
			{
				_id: string;
				_source: {
					code: string;
					subtitle: string;
					type: string;
					title: string;
					secure: boolean;
					url: string;
				};
			},
		];
	};
}
export interface radioStationData {
	error: string;
	data: {
		type: string;
		title: string;
		id: string;
		url: string;
		stream: string;
		website: string;
		secure: boolean;
		place: { id: string; title: string };
		country: { id: string; title: string };
	};
}
