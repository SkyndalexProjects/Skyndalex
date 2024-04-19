import type {
	Interaction,
	MessageComponentInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../classes/Client";

export interface Command {
	data: SlashCommandBuilder;
	run: (client: SkyndalexClient, interaction: Interaction) => Promise<void>;
}
export interface Component {
	customId: string;
	run: (
		client: SkyndalexClient,
		interaction: MessageComponentInteraction,
	) => Promise<void>;
}
