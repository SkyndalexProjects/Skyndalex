import type { SkyndalexClient } from "#classes";
import { ButtonBuilder, EmbedBuilder } from "#builders";
import {
	ActionRowBuilder,
	ButtonStyle,
	ChannelType,
	ModalBuilder,
	PermissionFlagsBits,
	TextInputBuilder,
	TextInputStyle,
	type MessageComponentInteraction,
} from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	const value = interaction.customId.split("-")[1];
	const getCategory = await client.prisma.ticketButtons.findFirst({
		where: {
			customId: Number.parseInt(value),
		},
	});

	const getModals = await client.prisma.ticketModals.findMany({
		where: {
			categoryId: `ticketCategory-${getCategory.customId}`,
			guildId: interaction.guild.id,
		},
	});

	if (getModals.length >= 1) {
		const modal = new ModalBuilder()
			.setCustomId(`ticketModal-${getCategory.customId}`)
			.setTitle("TICKET_CREATE_TITLE");

		for (const option of getModals) {
			const styles = {
				SHORT: TextInputStyle.Short,
				PARAGRAPH: TextInputStyle.Paragraph,
			};

			const input = new TextInputBuilder()
				.setCustomId(`${option.customId}-${option.label}`)
				.setLabel(option.label)
				.setPlaceholder(option.placeholder)
				.setRequired(option.required)
				.setStyle(styles[option.style]);

			const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
				input,
			);
			modal.addComponents(row);
		}

		await interaction.showModal(modal);
	} else {
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
			.setDescription("TICKET_CREATED_DESCRIPTION", {
				user: interaction.user.tag,
				category: getCategory.label,
				state: "open",
				id: ticket.id,
			})
			.setColor("Blue");

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
			content: `<@${interaction.user.id}>`,
			components: [actions],
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
}
