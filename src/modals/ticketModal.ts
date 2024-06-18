import type { SkyndalexClient } from "#classes";
import { EmbedBuilder, ButtonBuilder } from "#builders";
import {
	PermissionFlagsBits,
	type ModalSubmitInteraction,
	ChannelType,
	ActionRowBuilder,
	ButtonStyle,
} from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: ModalSubmitInteraction,
) {
	const fromCategory = interaction.customId.split("-")[1];
	const getCategory = await client.prisma.ticketButtons.findFirst({
		where: {
			guildId: interaction.guild.id,
			customId: Number.parseInt(fromCategory),
		},
	});

	const [lastTicketId] = await client.prisma.tickets.findMany({
		where: {
			guildId: interaction.guild.id,
		},
		orderBy: {
			id: "desc",
		},
		take: 1,
	});

	const channel = await interaction.guild.channels.create({
		name: `${interaction.user.username}-${lastTicketId?.id + 1 || 0}`,
		type: ChannelType.GuildText,
		parent: getCategory.discordChannelId,
		permissionOverwrites: [
			{
				id: interaction.user.id,
				allow: [
					PermissionFlagsBits.ViewChannel,
					PermissionFlagsBits.SendMessages,
					PermissionFlagsBits.ReadMessageHistory,
				],
			},
			{
				id: interaction.guild.roles.everyone.id,
				deny: [PermissionFlagsBits.ViewChannel],
			},
		],
	});

	const ticket = await client.tickets.create(
		lastTicketId?.id + 1 || 0,
		interaction.guild.id,
		interaction.user.id,
		channel.id,
		getCategory.discordChannelId,
		"open",
	);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("TICKET_CREATED_TITLE")
		.setDescription("TICKET_CREATED_DESCRIPTION_FROM_MODAL", {
			user: interaction.user.tag,
			category: getCategory.label,
			state: "open",
			id: ticket.id,
		})
		.setColor("Blue");

	interaction.fields.fields.map((field) => {
		embed.addFields([
			{
				name: field.customId.split("-")[1],
				value: field.value,
			},
		]);
	});

	const actions = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder(client, interaction.locale)
			.setCustomId(
				`archiveTicket-${ticket.id}-${interaction.user.id}`,
			)
			.setLabel("CLOSE_TICKET")
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder(client, interaction.locale)
			.setCustomId(`deleteTicket-${ticket.id}-${interaction.user.id}`)
			.setLabel("DELETE_TICKET")
			.setStyle(ButtonStyle.Secondary),
	);

	await channel.send({
		embeds: [embed],
		components: [actions],
	});

	return interaction.reply({
		content: client.i18n.t("TICKET_CREATED", {
			lng: interaction.locale,
			channel: channel.id,
		}),
		ephemeral: true,
	});
}
