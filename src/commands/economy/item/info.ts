import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../../classes/index.js";

export async function run(
	_client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	interaction.reply("item create");
}

export const data = new SlashCommandSubcommandBuilder()
	.setName("info")
	.setDescription("Item info.");
