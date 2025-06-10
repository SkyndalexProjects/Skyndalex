import {
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ContainerBuilder,
	MediaGalleryBuilder,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	SlashCommandBuilder,
	TextDisplayBuilder,
	ActionRowBuilder,
	version,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import os from "node:os";
import * as process from "node:process";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const botUptimeTimestamp = `<t:${Math.round(
		client.readyTimestamp / 1000,
	)}:R>`;

	const serverUptimeTimestamp = `<t:${Math.floor(
		Math.floor(Date.now() / 1000 - os.uptime()),
	)}:R>`;

	const cacheStatsTitle = new TextDisplayBuilder().setContent(
		"**Cache stats**",
	);
	const cacheStats = new TextDisplayBuilder().setContent(
		`Guilds: **${client.guilds.cache.size}**\n` +
			`Users: **${client.users.cache.size}**\n` +
			`Channels: **${client.channels.cache.size}**\n` +
			`Emojis: **${client.emojis.cache.size}**\n`,
	);
	const systemStatsTitle = new TextDisplayBuilder().setContent(
		"**System stats**",
	);
	const systemStats = new TextDisplayBuilder().setContent(
		`Memory usage: **${Math.round(
			process.memoryUsage().heapUsed / 1024 / 1024,
		)} MB**\n` +
			`Bot uptime: ${botUptimeTimestamp}\n` +
			`Server uptime: ${serverUptimeTimestamp}\n`,
	);
	const separator = new SeparatorBuilder().setSpacing(
		SeparatorSpacingSize.Large,
	);
	const packagesVersionTitle = new TextDisplayBuilder().setContent(
		"**Versions**",
	);
	const packagesVersion = new TextDisplayBuilder().setContent(
		`Discord.js: **v${version}**\n` +
			`Node.js: **v${process.versions.node}**\n` +
			`OS: ${os.platform()} ${os.release()}\n`,
	);

	const addButton = new ButtonBuilder()
		.setLabel("App directory")
		.setStyle(ButtonStyle.Link)
		.setURL(process.env.APP_DIRECTORY || "https://default-invite-url.com");

	const websiteButton = new ButtonBuilder()
		.setLabel("Website")
		.setStyle(ButtonStyle.Link)
		.setURL(process.env.FRONTEND_URL || "https://default-website-url.com");

	const dashboard = new ButtonBuilder()
		.setLabel("Dashboard")
		.setStyle(ButtonStyle.Link)
		.setURL(process.env.FRONTEND_URL || "https://default-dashboard-url.com");

	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		addButton,
		websiteButton,
		dashboard,
	);

	const container = new ContainerBuilder()
		.addTextDisplayComponents(cacheStatsTitle, cacheStats)
		.addSeparatorComponents(separator)
		.addTextDisplayComponents(systemStatsTitle, systemStats)
		.addSeparatorComponents(separator)
		.addTextDisplayComponents(packagesVersionTitle, packagesVersion)
		.addSeparatorComponents(separator)
		.addActionRowComponents(actionRow);

	await interaction.reply({
		flags: MessageFlags.IsComponentsV2,
		components: [container],
	});
}
export const data = new SlashCommandBuilder()
	.setName("info")
	.setDescription("Informations about bot.")
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
