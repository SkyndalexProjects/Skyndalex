import type { SkyndalexClient } from "../classes/Client.js";
import { EmbedBuilder } from "../classes/builders/EmbedBuilder.js";
import {
	PermissionFlagsBits,
	type ModalSubmitInteraction,
	ChannelType,
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
		name: `${getCategory.label}-${lastTicketId?.id + 1 || 0}`,
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

	const ticket = await client.prisma.tickets.create({
		data: {
			id: lastTicketId?.id + 1 || 0,
			userId: interaction.user.id,
			guildId: interaction.guild.id,
			ticketChannel: channel.id,
			ticketCategory: getCategory.discordChannelId,
			state: "open",
		},
	});

	console.log("interaction: ", interaction.message.components);

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

	await channel.send({
		embeds: [embed],
	});

	return interaction.reply({
		content: client.i18n.t("TICKET_CREATED", {
			lng: interaction.locale,
			channel: channel.id,
		}),
		ephemeral: true,
	});
}
