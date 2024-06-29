import type { SkyndalexClient } from "#classes";
import { ChannelSelectMenuBuilder, EmbedBuilder, StringSelectMenuBuilder } from "#builders";
import { ActionRowBuilder, type ModalSubmitInteraction, ChannelType} from "discord.js";

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

			const row1 = new ActionRowBuilder<ChannelSelectMenuBuilder>();
			row1.addComponents(
				new ChannelSelectMenuBuilder(client, interaction.locale)
					.setCustomId("ticketCategoryAssign")
					.setPlaceholder("TICKETS_SETUP_CATEGORY_PLACEHOLDER")
					.addChannelTypes(ChannelType.GuildCategory)
			);

			const row2 = new ActionRowBuilder<StringSelectMenuBuilder>();
			if (availableSelects.length >= 0) {
				row2.addComponents(
					new StringSelectMenuBuilder(client, interaction.locale)
						.setCustomId("ticketSelectAssign")
						.setPlaceholder("TICKETS_SETUP_SELECT_PLACEHOLDER")
						.addOptions(
							availableSelects.map((select) => ({
								label: select.label,
								value: select.customId.toString(),
							}))
						)
				);
			}

			const button = await client.manageComponents.ticketButtonActionsMenu(
				client,
				interaction.locale,
				"buttonCreation",
			);
			// @ts-expect-error
			await interaction.update({
				embeds: [embed],
				components: [row1, row2, button],
			});
		} catch (error) {
			console.error(error);
		}
}
