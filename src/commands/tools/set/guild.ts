import {
	ActionRowBuilder,
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import { EmbedBuilder, StringSelectMenuBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";
import type { Setting } from "#types";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const settings: Setting[] = await client.prisma.$queryRaw<Setting[]>`
        SELECT column_name FROM information_schema.columns WHERE table_name = 'settings'`;

	const availableSettings: { [key: string]: string }[] =
		await client.prisma.settings.findMany({
			where: {
				guildId: interaction.guild.id,
			},
		});

	if (client.user.id !== process.env.CLIENT_ID) {
		const customBotSettings =
			await client.prisma.customBotSettings.findUnique({
				where: {
					clientId: client.user.id,
					userId: interaction.user.id,
				},
			});

		if (customBotSettings) {
			availableSettings[0].autoRadioVoiceChannel =
				customBotSettings.autoRadioVoiceChannel;
			availableSettings[0].radioStation = customBotSettings.radioStation;
		}
	}

	const keys = settings.map((setting) => setting.column_name);

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
		.setFooter({
			text: "SUPPORT_INVITE_FOOTER",
			iconURL: client.user.displayAvatarURL(),
		})
		.addFields(
			keys
				.filter((key) => key !== "guildId")
				.map((key) => {
					let value = availableSettings[0]
						? availableSettings[0][key]
						: null;

					if (value === null) {
						value = client.i18n.t("CONFIG_NOT_SET", {
							lng: interaction.locale,
						});
					} else if (key.endsWith("Channel")) {
						value = `<#${value}>`;
					} else if (key.endsWith("Role")) {
						if (value !== null) {
							value = `<@&${value}>`;
						}
					}

					return {
						name: key,
						value,
						inline: true,
					};
				}),
		);
	return interaction.reply({
		embeds: [embed],
		components: [
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				select,
			),
		],
		ephemeral: true,
	});
}

export const data = new SlashCommandSubcommandBuilder()
	.setName("guild")
	.setDescription("Set guild settings");
