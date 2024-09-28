import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const guild = client.guilds.cache.get(interaction.guild.id);

	const embed = new EmbedBuilder(client, interaction.locale).setTitle(
		"SERVER_INFO_TITLE",
	)
			.addFields([
				{
					name: "SERVER_NAME",
					value: guild.name,
				},
				{
					name: "SERVER_USER_COUNT",
					value: guild.memberCount.toString(),
				},
				{
					name: "SERVER_EMOJIS",
					value: guild.emojis.cache
						.map((emoji) => emoji.toString())
						.join(" "),
				},
				{
					name: "SERVER_ROLES_LIST",
					value: guild.roles.cache
						.filter((role) => role.name !== "@everyone")
						.map((role) => role.toString())
						.join(" "),
				},
			])
			.setColor("Green")
			.setTimestamp()
			if (guild?.description)
				embed
					.setDescription(guild.description)
					
	return interaction.reply({ embeds: [embed] });
}
export const data = new SlashCommandBuilder()
	.setName("serverinfo")
	.setDescription("Check server info");
