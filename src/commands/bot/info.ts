import os from "node:os";
import * as process from "node:process";
import {
	ActionRowBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ContainerBuilder,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	SlashCommandBuilder,
	version,
} from "discord.js";
import { ButtonBuilder, TextDisplayBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";
import { buildResourceBar } from "#utils";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const locale = interaction.locale ?? "en-US";
	const botUptimeTimestamp = `<t:${Math.round(
		(client.readyTimestamp ?? Date.now()) / 1000,
	)}:R>`;

	const serverUptimeTimestamp = `<t:${Math.floor(
		Math.floor(Date.now() / 1000 - os.uptime()),
	)}:R>`;

	const formatNumber = (num: number) => num.toLocaleString();

	const cacheStatsTitle = new TextDisplayBuilder(client, locale).setContent(
		"info.cache_stats_title",
	);
	const cacheStats = new TextDisplayBuilder(client, locale).setContent(
		"info.cache_stats",
		{
			guilds: formatNumber(client.guilds.cache.size),
			users: formatNumber(client.users.cache.size),
			channels: formatNumber(client.channels.cache.size),
			emojis: formatNumber(client.emojis.cache.size),
		},
	);
	const systemStatsTitle = new TextDisplayBuilder(client, locale).setContent(
		"info.system_stats_title",
	);
	const memUsage = process.memoryUsage();
	const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
	const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
	const rssMB = Math.round(memUsage.rss / 1024 / 1024);
	const externalMB = Math.round(memUsage.external / 1024 / 1024);

	const totalSystemMemMB = Math.round(os.totalmem() / 1024 / 1024);
	const freeSystemMemMB = Math.round(os.freemem() / 1024 / 1024);
	const usedSystemMemMB = totalSystemMemMB - freeSystemMemMB;

	const totalSystemMem = Math.round(totalSystemMemMB / 1024);
	const freeSystemMem = Math.round(freeSystemMemMB / 1024);
	const usedSystemMem = Math.round(usedSystemMemMB / 1024);

	const systemStatsTemplate = client.i18n.t("info.system_stats", {
		lng: locale,
		heapUsed: heapUsedMB,
		heapTotal: heapTotalMB,
		heapBar: buildResourceBar(heapUsedMB, heapTotalMB),
		rss: rssMB,
		external: externalMB,
		usedMem: usedSystemMem,
		totalMem: totalSystemMem,
		memBar: buildResourceBar(usedSystemMemMB, totalSystemMemMB),
		freeMem: freeSystemMem,
		botUptime: botUptimeTimestamp,
		serverUptime: serverUptimeTimestamp,
		interpolation: { escapeValue: false },
	});

	const systemStats = new TextDisplayBuilder(client, locale).setRawContent(
		systemStatsTemplate,
	);
	const separator = new SeparatorBuilder().setSpacing(
		SeparatorSpacingSize.Large,
	);
	const packagesVersionTitle = new TextDisplayBuilder(
		client,
		locale,
	).setContent("info.packages_version_title");
	const packagesVersion = new TextDisplayBuilder(client, locale).setContent(
		"info.packages_version",
		{
			discordjs: version,
			nodejs: process.versions.node,
			osName: os.platform() === "win32" ? "Windows" : os.platform(),
			osVersion: os.release(),
		},
	);

	const addButton = new ButtonBuilder(client, locale)
		.setLabel("info.buttons.add")
		.setStyle(ButtonStyle.Link)
		.setURL(process.env.APP_DIRECTORY || "https://default-invite-url.com");

	const websiteButton = new ButtonBuilder(client, locale)
		.setLabel("info.buttons.website")
		.setStyle(ButtonStyle.Link)
		.setURL(process.env.FRONTEND_URL || "https://default-website-url.com");

	const dashboard = new ButtonBuilder(client, locale)
		.setLabel("info.buttons.dashboard")
		.setStyle(ButtonStyle.Link)
		.setURL(process.env.FRONTEND_URL || "https://default-dashboard-url.com");

	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		addButton,
		websiteButton,
		dashboard,
	);

	const container = new ContainerBuilder()
		.addTextDisplayComponents(cacheStatsTitle)
		.addSeparatorComponents(separator)
		.addTextDisplayComponents(cacheStats)
		.addSeparatorComponents(separator)
		.addTextDisplayComponents(systemStatsTitle, systemStats)
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
	.setDescription("Informations about bot")
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
