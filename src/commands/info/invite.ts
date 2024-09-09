import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const url = "https://discord.com/application-directory/1059594156839809074";

	return interaction.reply(
		client.i18n.t("BOT_INVITE", {
			lng: interaction.locale,
			url
		}),
	);
}
export const data = {
	...new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Invite")
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
};
