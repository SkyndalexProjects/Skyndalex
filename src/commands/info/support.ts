import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	return interaction.reply(client.i18n.t("SUPPORT_INVITE", { lng: interaction.locale }));
}
export const data = new SlashCommandBuilder()
	.setName("support")
	.setDescription("Get invite to the support");