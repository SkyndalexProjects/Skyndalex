import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	ChannelType,
} from "discord.js";
import type { SkyndalexClient } from "../../../../classes/Client.js";
import { EmbedBuilder } from "classes/builders/EmbedBuilder";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const label = interaction.options.getString("label");
	const description = interaction.options.getString("description");

	const channel = await interaction.guild.channels.create({
		name: label,
		type: ChannelType.GuildCategory,
	});

	await client.prisma.ticketSelects.create({
		data: {
			guildId: interaction.guild.id,
			discordChannelId: channel.id,
			label,
			description,
		},
	});
	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("SELECT_ADDED")
		.setDescription("SELECT_ADDED_DESC", {
			label,
			description,
		})
		.setColor("Green")
		.setTimestamp();

	return interaction.reply({ embeds: [embed] });
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("add-select")
	.setDescription("Add custom select category to tickets menu")
	.addStringOption((option) =>
		option
			.setName("label")
			.setDescription("Label of the select category")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("description")
			.setDescription("Description of the select category")
			.setRequired(true),
	);
