import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";

export async function run(client, interaction) {
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
			}
			settingsEmbed.addFields({
				name: key,
				value: String(formattedValue),
				inline: true,
			});
		}
		settingsEmbed.setColor("Green");
	}

	const select = new StringSelectMenuBuilder()
		.setCustomId("settings")
		.setPlaceholder("Change");
	const settings = getCurrentSettings[0];

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
	return interaction.reply({
		embeds: [settingsEmbed],
		components: [row],
		ephemeral: true,
	});
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("config")
	.setDescription("Set guild basic configuration");
