import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import find from "find-process";
export async function run(client, interaction) {
	const whatIsThis = interaction.customId.split("-")[1];
	const value = interaction.values[0];

	await client.prisma.settings.upsert({
		where: {
			guildId: interaction.guild.id,
		},
		create: {
			guildId: interaction.guild.id,
			[whatIsThis]: value,
		},
		update: {
			[whatIsThis]: value,
		},
	});

	const getCurrentSettings = await client.prisma.settings.findMany({
		where: {
			guildId: interaction.guild.id,
		},
	});

	const settingsEmbed = new EmbedBuilder().setTitle("Current guild settings");

	if (getCurrentSettings.length === 0) {
		settingsEmbed.setDescription("No settings found").setColor("Red");
	} else {
		const settings = getCurrentSettings[0];
		for (const [key, value] of Object.entries(settings)) {
			if (!value || key === "guildId") continue;
			let formattedValue = value;
			if (key.endsWith("Channel")) {
				formattedValue = `<#${value}>`;
			} else if (key.endsWith("Role")) {
				formattedValue = `<@&${value}>`;
			} else {
				formattedValue = value;
			}
			settingsEmbed.addFields({
				name: key,
				value: String(formattedValue),
				inline: true,
			});
		}
		settingsEmbed.setColor("Green");
	}
	const settings = getCurrentSettings[0];

	const select = new StringSelectMenuBuilder()
		.setCustomId("settings")
		.setPlaceholder("Change");
	for (const [key, value] of Object.entries(settings)) {
		if (key === "guildId") continue;
		select.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel(key)
				.setDescription(`Change ${key} setting`)
				.setValue(`settings-${key}`),
		);
	}
	const row = new ActionRowBuilder().addComponents(select);

	return interaction.update({ embeds: [settingsEmbed], components: [row] });
}
