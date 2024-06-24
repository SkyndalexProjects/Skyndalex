import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "#builders";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const buttonMenuComponents =
		await client.manageComponents.createTicketCustomButtonCreationMenu(
			client,
			interaction.locale,
		);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("TICKETS_SETUP_TITLE")
		.setDescription("TICKETS_SETUP_DESCRIPTION")
		.setFooter({
			text: "SUPPORT_INVITE_FOOTER",
			iconURL: client.user.displayAvatarURL(),
		})
		.setTimestamp()
		.setColor("Blurple")
		.setThumbnail(client.user.displayAvatarURL());

	await interaction.reply({
		embeds: [embed],
		components: [buttonMenuComponents],
		ephemeral: true,
	});
}

export const data = new SlashCommandSubcommandBuilder()
	.setName("setup")
	.setDescription("Tickets setup");
