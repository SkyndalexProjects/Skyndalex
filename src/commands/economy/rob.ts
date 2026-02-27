import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "../../classes/builders/index.js";
const successChance = 0.4;

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	//TODO: rob implementation
	interaction.reply("Rob");
}

export const data = new SlashCommandBuilder()
	.setName("rob")
	.setDescription("Rob.");
