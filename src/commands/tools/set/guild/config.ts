import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	ActionRowBuilder,
} from "discord.js";
import { EmbedBuilder } from "../../../../classes/builders/EmbedBuilder.js";
import { StringSelectMenuBuilder } from "../../../../classes/builders/components/StringSelectMenuBuilder.js";
import type { SkyndalexClient } from "../../../../classes/Client.js";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const settings = await client.prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'settings'`;
	const availableSettings = await client.prisma.settings.findMany({
		where: {
			guildId: interaction.guild.id,
		},
	});

	const keys = Object.keys(settings).map((key) => settings[key].column_name);
	const select = new StringSelectMenuBuilder(client, interaction.locale)
		.setPlaceholder("CONFIG_GUILD_SELECT_PLACEHOLDER")
		.setCustomId("config")
		.addOptions(
			keys
				.map((key) => ({
					label: key,
					value: key,
				}))
				.filter((option) => !option.value.endsWith("Id")),
		);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("CONFIG_GUILD_TITLE")
		.setColor("Blurple")
		.setFooter({ text: "SUPPORT_INVITE_FOOTER", iconURL: client.user.displayAvatarURL() })
		.setFields(
			keys
				.filter((key) => key !== "guildId")
				.map((key) => {
					if (availableSettings.length > 0) {
						return {
							name: key,
							value: availableSettings[0][key] || "N/A",
							inline: true,
						};
					}
					return {
						name: key,
						value: "N/A",
						inline: true,
					};
				}),
		);
	return interaction.reply({
		embeds: [embed],
		components: [
			new ActionRowBuilder<StringSelectMenuBuilder>({
				components: [select],
			}),
		],
		ephemeral: true,
	});
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("config")
	.setDescription("Set guild configuration");
