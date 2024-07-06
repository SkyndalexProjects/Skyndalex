import type { SkyndalexClient } from "#classes";
import { ButtonStyle, ActionRowBuilder } from "discord.js";
import { ButtonBuilder } from "#builders";
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
}
