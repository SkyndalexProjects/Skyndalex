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
export interface weatherData {
	current_condition: {
		FeelsLikeC: string;
		temp_C: string;
		humidity: string;
		windspeedKmph: string;
	};
}
export interface HuggingFaceText {
	generated_text: string;
}
export interface LocaleFieldOptions {
	name?: string;
	nameArgs?: Record<string, unknown>;
	value?: string;
	valueArgs?: Record<string, unknown>;
	rawName?: string;
	rawValue?: string;
	inline?: boolean;
}
export interface ainasepicsAPI {
	url: string;
}
export interface randomDog {
	url: string;
}
