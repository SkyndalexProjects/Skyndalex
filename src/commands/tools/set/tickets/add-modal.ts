import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	type AutocompleteInteraction,
} from "discord.js";
import type { SkyndalexClient } from "../../../../classes/Client.js";
import { EmbedBuilder } from "../../../../classes/builders/EmbedBuilder.js";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const cat = interaction.options.getString("ticket-category");
	const inputLabel = interaction.options.getString("input-label");
	const inputStyle = interaction.options.getString("input-style");
	const placeholder = interaction.options.getString("placeholder");
	const required = interaction.options.getBoolean("required");

	await client.prisma.ticketModals.create({
		data: {
			guildId: interaction.guild.id,
			label: inputLabel,
			style: inputStyle,
			placeholder: placeholder,
			required: required,
			categoryId: cat,
		},
	});

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("CUSTOM_MODAL_ADDED")
		.setDescription("CUSTOM_MODAL_ADDED_DESC", {
			cat,
			inputLabel,
			inputStyle,
			placeholder,
			required,
		})
		.setColor("Green")
		.setTimestamp();
	return interaction.reply({ embeds: [embed] });
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("add-modal")
	.setDescription("Add custom modal to ticket category")
	.addStringOption((option) =>
		option
			.setName("ticket-category")
			.setDescription("What category should the modal be added to?")
			.setAutocomplete(true)
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("input-label")
			.setDescription("Input label")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("input-style")
			.setDescription("Input style")
			.addChoices(
				{ name: "Paragraph", value: "PARAGRAPH" },
				{ name: "Short", value: "SHORT" },
			)
			.setRequired(true),
	)
	.addStringOption((option) =>
		option.setName("placeholder").setDescription("Input placeholder"),
	)
	.addBooleanOption((option) =>
		option.setName("required").setDescription("Is input required?"),
	);

export async function autocomplete(interaction: AutocompleteInteraction) {
	const focusedValue = interaction.options.getFocused(true).value || "";
	const categories = await (
		interaction.client as SkyndalexClient
	).prisma.ticketButtons.findMany({
		where: {
			guildId: interaction.guild.id,
		},
	});

	const filteredCategories = categories.filter((category) =>
		category.label.startsWith(focusedValue),
	);

	const data = filteredCategories.map((category) => ({
		name: `${category.label} (ID: ${category.customId})`,
		value: `ticketCategory-${category.customId}`,
	}));

	await interaction.respond(data);
}
