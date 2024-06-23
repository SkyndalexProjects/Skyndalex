import type { SkyndalexClient } from "#classes";
import { ChannelType, ButtonStyle, ActionRowBuilder } from "discord.js";
import {
	ChannelSelectMenuBuilder,
	StringSelectMenuBuilder,
	ButtonBuilder,
} from "#builders";

export async function getSelects(
	client: SkyndalexClient,
	guildId: string,
	locale: string,
) {
	const modals = await client.prisma.ticketModals.findMany({
		where: {
			guildId: guildId,
		},
	});
	const selects = await client.prisma.ticketSelects.findMany({
		where: {
			guildId: guildId,
		},
	});

	const creationMenu = new ActionRowBuilder<
		ChannelSelectMenuBuilder | StringSelectMenuBuilder
	>().addComponents(
		new ChannelSelectMenuBuilder(client, locale)
			.setCustomId("ticketChannelSetup")
			.setPlaceholder("TICKETS_SETUP_CATEGORY_PLACEHOLDER")
			.addChannelTypes(ChannelType.GuildCategory),
	);

	const buttonMenu = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder(client, locale)
			.setCustomId("ticketConfirm")
			.setLabel("CONFIRM")
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder(client, locale)
			.setCustomId("ticketCancel")
			.setLabel("CANCEL")
			.setStyle(ButtonStyle.Danger),
	);

	if (modals.length > 0) {
		const modalSelect = new StringSelectMenuBuilder(client, locale)
			.setCustomId("ticketModalAssign")
			.setPlaceholder("TICKETS_SETUP_ASSIGN_MODAL_PLACEHOLDER")
			.addOptions(
				modals.map((modal) => ({
					label: modal.label,
					value: modal.customId.toString(),
				})),
			);

		creationMenu.addComponents(modalSelect);
	} else if (selects.length > 0) {
		const selectSelect = new StringSelectMenuBuilder(client, locale)
			.setCustomId("ticketSelectAssign")
			.setPlaceholder("TICKETS_SETUP_ASSIGN_SELECT_PLACEHOLDER")
			.addOptions(
				selects.map((select) => ({
					label: select.label,
					value: select.customId.toString(),
				})),
			);
		creationMenu.addComponents(selectSelect);
	}

	return { creationMenu, buttonMenu };
}
