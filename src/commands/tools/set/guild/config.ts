import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	ActionRowBuilder,
} from "discord.js";
import { EmbedBuilder } from "classes/builders/EmbedBuilder";
import { StringSelectMenuBuilder } from "classes/builders/components/StringSelectMenuBuilder";
import type { SkyndalexClient } from "../../../../classes/Client";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
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
		.setColor("Blurple")
		.setFields(
			fields.map((field) => ({
				...field,
				value: field.value.toString(),
			})),
		);

	return interaction.reply({
		embeds: [embed],
		components: [
			new ActionRowBuilder<StringSelectMenuBuilder>({
				components: [select],
			}),
		],
	});
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("config")
	.setDescription("Set guild configuration");
