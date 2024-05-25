import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	type AutocompleteInteraction,
} from "discord.js";
import type { SkyndalexClient } from "../../../classes/Client";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const user = interaction.options.getUser("user");
	const ticketId = interaction.options.getString("ticket");

	if (user.bot)
		return interaction.reply({
			content: client.i18n.t("CANNOT_ASSIGN_BOT", {
				lng: interaction.locale,
			}),
			ephemeral: true,
		});

	const getIdFromChannel = await client.prisma.tickets.findFirst({
		where: {
			ticketChannel: interaction.channel.id,
		},
	});
	if (!getIdFromChannel)
		return interaction.reply({
			content: client.i18n.t("NO_TICKET_CHANNEL_ERROR", {
				lng: interaction.locale,
			}),
			ephemeral: true,
		});

	const ticket = await client.prisma.tickets.findFirst({
		where: {
			id: Number.parseInt(ticketId?.split("-")[1]) || getIdFromChannel.id,
		},
	});

	if (user.id === ticket.userId)
		return interaction.reply({
			content: client.i18n.t("CANNOT_ASSIGN_SELF", {
				lng: interaction.locale,
			}),
			ephemeral: true,
		});

	if (!ticket)
		return interaction.reply({
			content: client.i18n.t("NO_TICKET_CHANNEL_ERROR", {
				lng: interaction.locale,
			}),
			ephemeral: true,
		});

	const update = await client.prisma.tickets.update({
		where: {
			guildId_userId_id: {
				guildId: interaction.guild.id,
				userId: ticket.userId,
				id: ticket.id,
			},
		},
		data: {
			assignedTo: user.id,
		},
	});

	return interaction.reply({
		content: client.i18n.t("TICKET_ASSIGNED", {
			lng: interaction.locale,
			user: user.username,
			ticketId: ticket.id,
			userId: user.id,
		}),
	});
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("assign")
	.setDescription("Assign")
	.addUserOption((option) =>
		option
			.setName("user")
			.setDescription("User to assign")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("ticket")
			.setDescription("Ticket to assign")
			.setAutocomplete(true),
	);

export async function autocomplete(interaction: AutocompleteInteraction) {
	const focusedValue = interaction.options.getFocused(true).value;
	const tickets = await (
		interaction.client as SkyndalexClient
	).prisma.tickets.findMany({
		where: {
			guildId: interaction.guild.id,
		},
	});

	const data = await Promise.all(
		tickets.map(async (ticket) => {
			const user = await interaction.client.users.fetch(ticket.userId);
			return {
				name: `${user.username}-${ticket.id.toString()}`,
				value: `${ticket.userId}-${ticket.id.toString()}`,
			};
		}),
	);

	const filteredData = data.filter((ticket) =>
		ticket.name.includes(focusedValue),
	);

	await interaction.respond(filteredData);
}
