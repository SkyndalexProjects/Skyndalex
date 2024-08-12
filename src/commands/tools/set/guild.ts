import {
	ActionRowBuilder,
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { StringSelectMenuBuilder, EmbedBuilder } from "#builders";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const settings = await client.prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'settings'`;

	let availableSettings = await client.prisma.settings.findMany({
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
					if (value === null)
						value = client.i18n.t("CONFIG_NOT_SET", {
							lng: interaction.locale,
						});

					return {
						name: key,
						value: value,
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
