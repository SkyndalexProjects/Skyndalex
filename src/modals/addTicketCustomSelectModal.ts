import type { SkyndalexClient } from "#classes";
import { EmbedBuilder, StringSelectMenuBuilder } from "#builders";
import { type ModalSubmitInteraction, ActionRowBuilder } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: ModalSubmitInteraction<"cached">,
) {
	const name = interaction.fields.getTextInputValue("selectName");

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("TICKETS_SETUP_TITLE")
		.setDescription("TICKETS_SETUP_STATUS_SELECTS_ASSIGNATION")
		.setFooter({
			text: "SUPPORT_INVITE_FOOTER",
			iconURL: client.user.displayAvatarURL(),
		})
		.addFields([
			{
				name: "ADD_TICKET_CUSTOM_SELECT_MODAL_NAME",
				value: name,
				inline: true,
			},
		])
		.setTimestamp()
		.setColor("Blurple")
		.setThumbnail(client.user.displayAvatarURL());

	const buttons = await client.prisma.ticketButtons.findMany({
		where: {
			guildId: interaction.guildId,
		},
	});

	const buttonAssignation =
		new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder(client, interaction.locale)
				.setCustomId("ticketSelectButtonAssign")
				.setPlaceholder("TICKETS_SETUP_ASSIGN_BUTTON_PLACEHOLDER")
				.setMaxValues(buttons.length)
				.addOptions(
					buttons.map((button) => ({
						label: button.label,
						value: button.customId.toString(),
					})),
				),
		);

	const button = await client.manageComponents.ticketButtonActionsMenu(
		client,
		interaction.locale,
		"selectCreation"
	);

	// @ts-expect-error

	await interaction.update({
		embeds: [embed],
		components: [buttonAssignation, button],
	});
}
