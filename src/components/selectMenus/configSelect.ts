import { ActionRowBuilder, type StringSelectMenuInteraction } from "discord.js";
import { EmbedBuilder, StringSelectMenuBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: StringSelectMenuInteraction,
) {
	const value = interaction.values[0];
	const option = interaction.customId.split("-")[1];

	if (option === "autoRadioVoiceChannel") {
		if (client.user.id !== process.env.CLIENT_ID) {
			await client.prisma.customBotSettings.upsert({
				where: {
					clientId: client.user.id,
					userId: interaction.user.id,
					guildId: interaction.guild.id,
				},
				create: {
					guildId: interaction.guild.id,
					clientId: client.user.id,
					userId: interaction.user.id,
					autoRadioVoiceChannel: value,
				},
				update: {
					autoRadioVoiceChannel: value,
				},
			});
		} else {
			await client.prisma.settings.upsert({
				where: {
					guildId: interaction.guild.id,
				},
				create: {
					guildId: interaction.guild.id,
					autoRadioVoiceChannel: value,
				},
				update: {
					autoRadioVoiceChannel: value,
				},
			});
		}
	} else {
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
	}
	
	let availableSettings = await client.prisma.settings.findMany({
		where: {
			guildId: interaction.guild.id,
		},
	});

	if (client.user.id !== process.env.CLIENT_ID) {
		const customBotSettings =
			await client.prisma.customBotSettings.findMany({
				where: {
					clientId: client.user.id,
					userId: interaction.user.id,
				},
			});

		if (customBotSettings.length > 0) {
			availableSettings[0].autoRadioVoiceChannel =
				customBotSettings[0]?.autoRadioVoiceChannel;
		}
	}

	const fields = Object.keys(availableSettings[0])
		.map((key, index) => {
			const value = Object.values(availableSettings[0])[index];
			return {
				name: key,
				value: value,
				inline: true,
			};
		})
		.filter((field) => !!field.value);

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
			fields
				.map((field) => ({
					...field,
					value: field.name.endsWith("Channel")
						? `<#${field.value}>`
						: `\`${field.value}\``,
				}))
				.filter((field) => field.name !== "guildId"),
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
