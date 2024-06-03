import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	type AutocompleteInteraction,
	ChannelType,
	type Channel,
} from "discord.js";
import type { SkyndalexClient } from "../../../../classes/Client.js";
import { EmbedBuilder } from "../../../../classes/builders/EmbedBuilder.js";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const label = interaction.options.getString("label");
	const style = interaction.options.getString("style");
	const select = interaction.options.getString("assign-to-select");

	console.log(select.split("-")[1]);

	let channel: Channel;

	if (!select) {
		channel = await interaction.guild.channels.create({
			name: label,
			type: ChannelType.GuildCategory,
		});
	}

	const getSelect = await client.prisma.ticketSelects.findFirst({
		where: {
			guildId: interaction.guild.id,
			customId: Number.parseInt(select.split("-")[1]),
		},
	});

	await client.prisma.ticketButtons.create({
		data: {
			label,
			style,
			guildId: interaction.guild.id,
			discordChannelId: channel?.id || getSelect?.discordChannelId,
			assignedToSelect: select,
		},
	});

	const embedSuccess = new EmbedBuilder(client, interaction.locale)
		.setTitle("CUSTOM_BUTTON_ADD_SUCCESS")
		.setDescription("CUSTOM_BUTTON_ADD_SUCCESS_DESCRIPTION", {
			name: label,
			button: style,
			channel: channel,
		})
		.setColor("Green");

	return interaction.reply({ embeds: [embedSuccess] });
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("add-button")
	.setDescription("Add custom button")
	.addStringOption((option) =>
		option
			.setName("label")
			.setDescription("Button label")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("style")
			.setDescription("Button style")
			.addChoices(
				{ name: "Primary", value: "PRIMARY" },
				{ name: "Secondary", value: "SECONDARY" },
				{ name: "Success", value: "SUCCESS" },
				{ name: "Danger", value: "DANGER" },
			)
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("assign-to-select")
			.setDescription("Assign button to select category")
			.setAutocomplete(true),
	);

export async function autocomplete(interaction: AutocompleteInteraction) {
	const focusedValue = interaction.options.getFocused(true).value || "";
	const categories = await (
		interaction.client as SkyndalexClient
	).prisma.ticketSelects.findMany({
		where: {
			guildId: interaction.guild.id,
		},
	});

	const filteredCategories = categories.filter((category) =>
		category.label.startsWith(focusedValue),
	);

	const data = filteredCategories.map((category) => ({
		name: `${category.label} (ID: ${category.customId})`,
		value: `ticketSelectCategory-${category.customId}`,
	}));

	await interaction.respond(data);
}
