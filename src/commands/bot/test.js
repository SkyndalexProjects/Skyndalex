import {
	EmbedBuilder,
	SlashCommandBuilder,
	ButtonBuilder,
	ActionRowBuilder,
} from "discord.js";
import fetch from "node-fetch";

export async function run(client, interaction) {
	client.emit('guildMemberAdd', interaction.member);
}

export const data = new SlashCommandBuilder()
	.setName("test")
	.setDescription("test");
