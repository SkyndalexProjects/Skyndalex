import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	SlashCommandBuilder,
} from "discord.js";

export async function run(client, interaction) {
	await interaction.reply({
		content: `Ping: \`${client.ws.ping}\``,
	});
}

export const data = new SlashCommandBuilder()
	.setName("ping")
	.setDescription("Replies with Pong!");
