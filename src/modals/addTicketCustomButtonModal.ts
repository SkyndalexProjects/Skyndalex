import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "#builders";
import type { ModalSubmitInteraction } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: ModalSubmitInteraction<"cached">,
) {
	const name = interaction.fields.getTextInputValue("buttonName");

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("TICKETS_SETUP_TITLE")
		.setDescription("TICKETS_SETUP_STATUS")
		.addFields([
			{
				name: "TICKETS_SETUP_CREATING_BUTTON_NAME",
				value: name,
				inline: true,
			},
		])
		.setFooter({
			text: "SUPPORT_INVITE_FOOTER",
			iconURL: client.user.displayAvatarURL(),
		})
		.setTimestamp()
		.setColor("Blurple")
		.setThumbnail(client.user.displayAvatarURL());

	const select = await client.manageComponents.createTicketCreationSelects(
		client,
		interaction.guildId,
	);

	const button = await client.manageComponents.ticketButtonActionsMenu(
		client,
		interaction.locale,
		"buttonCreation"
	);

	// @ts-expect-error

	await interaction.update({
		embeds: [embed],
		components: [select, button],
	});
}
