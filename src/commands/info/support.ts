import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	return interaction.reply({
		content: client.i18n.t("SUPPORT_INVITE", { lng: interaction.locale }),
		ephemeral: true,
	});
}
export const data = {
	...new SlashCommandBuilder()
		.setName("support")
		.setDescription("Get invite to the support")
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
};
