import type { SkyndalexClient } from "#classes";
import {
	ChannelSelectMenuBuilder,
	EmbedBuilder,
	StringSelectMenuBuilder,
} from "#builders";
import {
	ActionRowBuilder,
	type ModalSubmitInteraction,
	ChannelType,
	type ButtonBuilder,
} from "discord.js";

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

	try {
		const availableSelects = await client.prisma.ticketSelects.findMany({
			where: {
				guildId: interaction.guildId,
			},
		});

		const categoryAssign = new ActionRowBuilder<
			ChannelSelectMenuBuilder | StringSelectMenuBuilder | ButtonBuilder
		>();
		categoryAssign.addComponents(
			new ChannelSelectMenuBuilder(client, interaction.locale)
				.setCustomId("ticketCategoryAssign")
				.setPlaceholder("TICKETS_SETUP_CATEGORY_PLACEHOLDER")
				.addChannelTypes(ChannelType.GuildCategory),
		);
		const selectAssign = new ActionRowBuilder<StringSelectMenuBuilder>();
		selectAssign.addComponents(
			new StringSelectMenuBuilder(client, interaction.locale)
				.setCustomId("ticketSelectAssign")
				.setPlaceholder("TICKETS_SETUP_SELECT_PLACEHOLDER")
				.addOptions(
					availableSelects.map((select) => ({
						label: select.label,
						value: select.customId.toString(),
					})),
				),
		);

		const button = await client.manageComponents.ticketButtonActionsMenu(
			client,
			interaction.locale,
			"buttonCreation",
		);

		const components = [categoryAssign];

		if (availableSelects.length > 0) {
			components.push(selectAssign);
		}

		components.push(button);

		// @ts-expect-error
		await interaction.update({
			embeds: [embed],
			components: components,
		});
	} catch (error) {
		console.error(error);
	}
}
