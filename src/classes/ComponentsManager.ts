import type { SkyndalexClient } from "#classes";
import { ChannelType, ButtonStyle, ActionRowBuilder } from "discord.js";
import { ChannelSelectMenuBuilder, ButtonBuilder } from "#builders";
export class ComponentsManager {
	constructor(private readonly client: SkyndalexClient) {
		this.client = client;
	}
	async ticketButtonActionsMenu(
		client: SkyndalexClient,
		locale: string,
		type: string,
	) {
		const buttonMenu = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder(client, locale)
				.setCustomId(`ticketConfirm-${type}`)
				.setLabel("CONFIRM")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder(client, locale)
				.setCustomId("ticketCancel")
				.setLabel("CANCEL")
				.setStyle(ButtonStyle.Danger),
		);
		return buttonMenu;
	}
	async createTicketCreationSelects(client: SkyndalexClient, locale: string) {
		const creationMenu =
			new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
				new ChannelSelectMenuBuilder(client, locale)
					.setCustomId("ticketCategoryAssign")
					.setPlaceholder("TICKETS_SETUP_CATEGORY_PLACEHOLDER")
					.addChannelTypes(ChannelType.GuildCategory),
			);

		return creationMenu;
	}
	async createTicketCustomButtonCreationMenu(
		client: SkyndalexClient,
		locale: string,
	) {
		const buttonMenu = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder(client, locale)
				.setCustomId("addTicketButton")
				.setLabel("Button")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder(client, locale)
				.setCustomId("addTicketSelect")
				.setLabel("Select")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder(client, locale)
				.setCustomId("ticketModal")
				.setLabel("Modal")
				.setStyle(ButtonStyle.Primary),
		);

		return buttonMenu;
	}
}
