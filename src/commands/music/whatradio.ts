import { RadioProvider } from "@prisma/client";
import {
	ChannelType,
	type ChatInputCommandInteraction,
	ContainerBuilder,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	SlashCommandBuilder,
	TextDisplayBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction<"cached">,
) {
	await interaction.deferReply();

	const channel = interaction.options.getChannel("channel");
	const guildId = interaction.guild.id;

	const instanceByGuild = client.radioStateManager.getInstance(guildId);
	const instanceByChannel = channel
		? client.radioStateManager.getInstance(`${guildId}-${channel.id}`)
		: undefined;

	const instance = instanceByChannel ?? instanceByGuild;

	if (!instance) {
		return await interaction.editReply({
			content: "No radio instance is currently playing on this server.",
		});
	}

	if (channel && instance.voiceChannelId !== channel.id) {
		return await interaction.editReply({
			content: `No radio instance is currently playing in <#${channel.id}>.`,
		});
	}

	let song: { streamTitle?: string; icyName?: string };
	try {
		song = await client.radio.fetchCurrentlyPlayingSong(instance.resourceUrl);
	} catch (error) {
		console.error("Failed to fetch currently playing song", error);
		song = {};
	}

	const streamTitle = song.streamTitle ?? "Unknown track";

	const statusEmoji = instance.status === "playing" ? "▶️" : "⏯️";
	const statusText =
		instance.status === "playing" ? "Playing" : `State: ${instance.status}`;

	const provider = instance.resourceUrl?.includes("radio.garden")
		? RadioProvider.RADIO_GARDEN
		: RadioProvider.RADIO_BROWSER;

	const stationName = instance.radioStation ?? song.icyName ?? "Unknown";
	const executionDate = instance.executionDate ?? Date.now();
	const requestedBy = instance.requestedBy;

	const title = new TextDisplayBuilder().setContent("**Now Playing**");

	const desc = new TextDisplayBuilder().setContent(
		`${statusEmoji} | ${statusText}: **\`${streamTitle}\`**\n` +
			`📻 | Station: \`${stationName}\`\n` +
			`🔊 | Voice Channel: <#${instance.voiceChannelId}>\n` +
			`💾 | Provider: \`${provider}\`\n` +
			(requestedBy ? `🙋 | Requested by: <@${requestedBy}>\n` : "") +
			`🕒 | Since: <t:${Math.floor(executionDate / 1000)}:R>\n`,
	);

	const footer = new TextDisplayBuilder().setContent(
		"-# 🔗 | Tip: You can manage the radio playback via Dashboard\n" +
			"-# ⚠️ | Some stations might have inaccurate metadata or might not work as expected.",
	);

	const separator = new SeparatorBuilder().setSpacing(
		SeparatorSpacingSize.Large,
	);

	const container = new ContainerBuilder()
		.addTextDisplayComponents(title, desc)
		.addSeparatorComponents(separator)
		.addTextDisplayComponents(footer)
		.setAccentColor(0x3e6bff);

	await interaction.editReply({
		flags: MessageFlags.IsComponentsV2,
		components: [container],
	});
}

export const data = new SlashCommandBuilder()
	.setName("whatradio")
	.setDescription("Check a radio instance currently playing on this guild")
	.addChannelOption((option) =>
		option
			.setName("channel")
			.setDescription("The voice channel to check the radio for")
			.addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
			.setRequired(false),
	);
