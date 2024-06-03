import type { SkyndalexClient } from "../../classes/Client.js";
import {
	ActionRowBuilder,
	type StringSelectMenuInteraction,
	ButtonBuilder,
	ButtonStyle,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
export async function run(
	client: SkyndalexClient,
	interaction: StringSelectMenuInteraction,
) {
	const option = interaction.values[0].split("-")[1];

	const buttonsFromSelect = await client.prisma.ticketButtons.findMany({
		where: {
			guildId: interaction.guild.id,
			assignedToSelect: `ticketSelectCategory-${option}`,
		},
	});

	if (buttonsFromSelect.length <= 0)
		return interaction.reply({
			content: client.i18n.t("NO_CUSTOM_BUTTONS_FOUND", {
				lng: interaction.locale,
			}),
		});

	const selects = await client.prisma.ticketSelects.findMany({
		where: {
			guildId: interaction.guild.id,
		},
	});

	const selectActionRow = new ActionRowBuilder<StringSelectMenuBuilder>();
	const buttonActionRow = new ActionRowBuilder<ButtonBuilder>();

	if (selects.length > 0) {
		const selectOptions = selects.map((select) => {
			return new StringSelectMenuOptionBuilder()
				.setLabel(select.label.toString())
				.setDescription(select.description.toString())
				.setValue(`select-${select.customId}`);
		});

		const selectBuilder = new StringSelectMenuBuilder()
			.setPlaceholder("Select an option")
			.setCustomId("ticketSelectCategory")
			.addOptions(selectOptions);

		selectActionRow.addComponents(selectBuilder);
	}

	const styles = {
		PRIMARY: ButtonStyle.Primary,
		SECONDARY: ButtonStyle.Secondary,
		SUCCESS: ButtonStyle.Success,
		DANGER: ButtonStyle.Danger,
	};

	for (const button of buttonsFromSelect) {
		const buttonBuilder = new ButtonBuilder()
			.setStyle(styles[button.style])
			.setLabel(button.label)
			.setCustomId(`ticketCategory-${button.customId}`);
		buttonActionRow.addComponents(buttonBuilder);
	}

	return interaction.update({
		components: [buttonActionRow, selectActionRow],
	});
}
