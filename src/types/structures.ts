import type {
	Interaction,
	MessageComponentInteraction,
	ModalSubmitInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
export interface DiscordOauthResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}
export interface DiscordUser {
	id: string;
	username: string;
	avatar: string | null;
	discriminator: string;
	public_flags: number;
	flags: number;
	banner: string | null;
	accent_color: number | null;
	global_name: string | null;
	avatar_decoration_data: unknown | null;
	collectibles: unknown | null;
	banner_color: string | null;
	clan: unknown | null;
	primary_guild: unknown | null;
	mfa_enabled: boolean;
	locale: string;
	premium_type: number;
	email: string;
	verified: boolean;
}
export interface Command {
	category: string;
	data: SlashCommandBuilder & { integration_types?: string[] };
	run: (client: SkyndalexClient, interaction: Interaction) => Promise<void>;
	autocomplete: (interaction: Interaction) => Promise<void>;
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
export interface Component {
	customId: string;
	run: (
		client: SkyndalexClient,
		interaction: MessageComponentInteraction,
	) => Promise<void>;
}

export interface Card {
	id: string;
	name: string;
	value: number;
	suit: "spade" | "heart" | "diamond" | "club";
	visible: boolean;
}
export interface Hand {
	cards: Card[];
	value: number;
}
export interface BlackjackState {
	deck: Card[];
	playerCards: Card[];
	dealerCards: Card[];
	bet: number;
}
