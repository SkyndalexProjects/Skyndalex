import type {
	Interaction,
	MessageComponentInteraction,
	ModalSubmitInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export interface Command {
	category: string;
	data: SlashCommandBuilder & { integration_types?: string[] };
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
export interface Modal {
	customId: string;
	run: (
		client: SkyndalexClient,
		interaction: ModalSubmitInteraction,
	) => Promise<void>;
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
export interface radioStatus {
	requestedBy: string;
	radioStation: string;
	resourceUrl: string;
}
export interface Setting {
    column_name: string;
};