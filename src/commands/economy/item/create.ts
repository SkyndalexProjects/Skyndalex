import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../../classes/index.js";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	interaction.reply("item create");
}

export const data = new SlashCommandSubcommandBuilder()
	.setName("create")
	.setDescription("Create item.");
