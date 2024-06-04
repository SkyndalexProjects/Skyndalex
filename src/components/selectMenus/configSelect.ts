import type { SkyndalexClient } from "../../classes/Client.js";
import { type StringSelectMenuInteraction, ActionRowBuilder } from "discord.js";
import { StringSelectMenuBuilder, EmbedBuilder } from "#builders";
export async function run(
	client: SkyndalexClient,
	interaction: StringSelectMenuInteraction,
) {
	const value = interaction.values[0];
	const option = interaction.customId.split("-")[1];

	await client.prisma.settings.upsert({
		where: {
			guildId: interaction.guild.id,
		},
		create: {
			guildId: interaction.guild.id,
			[option]: value,
		},
		update: {
			[option]: value,
		},
	});

	const availableSettings = await client.prisma.settings.findMany({
		where: {
			guildId: interaction.guild.id,
		},
	});

	const fields = Object.keys(availableSettings[0])
		.map((key, index) => {
			const value = Object.values(availableSettings[0])[index];
			return {
				name: key,
				value: value,
				inline: true,
			};
		})
		.filter((field) => field.value !== null);

	const select = new StringSelectMenuBuilder(client, interaction.locale)
		.setPlaceholder("CONFIG_GUILD_SELECT_PLACEHOLDER")
		.setCustomId("config")
		.addOptions(
			Object.keys(availableSettings[0])
				.map((key) => {
					return {
						label: key,
						value: key,
					};
				})
				.filter(
					(option) =>
						option.label !== "guildId" &&
						!option.label.endsWith("Id"),
				),
		);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("CONFIG_GUILD_TITLE")
		.setDescription("CONFIG_GUILD_DESCRIPTION", {
			option,
			value,
		})
		.setColor("Blurple")
		.setFields(
			fields.map((field) => ({
				...field,
				value: field.value.toString(),
			})),
		);

	return interaction.update({
		embeds: [embed],
		components: [
			new ActionRowBuilder<StringSelectMenuBuilder>({
				components: [select],
			}),
		],
	});
}
