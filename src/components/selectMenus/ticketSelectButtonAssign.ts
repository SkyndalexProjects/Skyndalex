import type { SkyndalexClient } from "#classes";
import { EmbedBuilder, StringSelectMenuBuilder } from "#builders";
import { type StringSelectMenuInteraction, ActionRowBuilder } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: StringSelectMenuInteraction,
) {
	const values = interaction.values;

	const getButtons = await client.prisma.ticketButtons.findMany({
		where: {
			guildId: interaction.guildId,
		},
	});

	const selectedButtons = getButtons.filter((button) =>
		values.includes(button.customId.toString()),
	);

	const embedData = interaction.message.embeds[0].fields[0];
	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("TICKETS_SETUP_TITLE")
		.setDescription("TICKETS_SETUP_STATUS_SELECTS_BUTTONS_ASSIGNED")
		.addFields([
			{
				name: "ADD_TICKET_CUSTOM_SELECT_MODAL_NAME",
				value: embedData.value,
				inline: true,
			},
			{
				name: "TICKETS_SETUP_BUTTON_ASSIGNED",
				value: selectedButtons.map((button) => button.label).join(", "),
				inline: true,
			},
		])
		.setFooter({
			text: "SUPPORT_INVITE_FOOTER",
			iconURL: client.user.displayAvatarURL(),
		})
		.setTimestamp()
		.setColor("Green")
		.setThumbnail(client.user.displayAvatarURL());

	const buttonAssignation =
		new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder(client, interaction.locale)
				.setCustomId("ticketSelectButtonAssign")
				.setPlaceholder("TICKETS_SETUP_ASSIGN_BUTTON_PLACEHOLDER")
				.setMaxValues(getButtons.length)
				.addOptions(
					getButtons.map((button) => ({
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

	await interaction.update({
		embeds: [embed],
		components: [buttonAssignation, button],
	});
}
