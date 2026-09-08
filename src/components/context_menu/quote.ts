import {
	ApplicationCommandType,
	ContextMenuCommandBuilder,
	type MessageContextMenuCommandInteraction,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	_client: SkyndalexClient,
	interaction: MessageContextMenuCommandInteraction,
) {
	const message = interaction.targetMessage;
	const user = message.author;
	const author =
		interaction.guild?.members.cache.get(user.id)?.displayName ??
		user.displayName ??
		user.username;

	await interaction.deferReply();

	const removeButton = new ButtonBuilder()
		.setLabel("Remove quote")
		.setStyle(ButtonStyle.Primary)
		.setCustomId("jebana_kurwa_szmato_zamknij_sie");

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(removeButton);

	await _client.prisma.userQuotes.create({
		data: {
			userId: interaction.user.id,
			author,
			quote: message.content,
		},
	});

	const attachment = await _client.canvas.quote.createAttachment(
		{
			message: message.content,
			author: author,
			user,
		},
		"quote.png",
	);

	await interaction.editReply({ files: [attachment], components: [row] });
}

export const data = new ContextMenuCommandBuilder()
	.setName("Make It Quote")
	.setType(ApplicationCommandType.Message);
