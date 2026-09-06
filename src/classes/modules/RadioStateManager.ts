import type { GuildMember, TextChannel } from "discord.js";
import type { RadioInstanceState } from "#types";
import type { SkyndalexClient } from "../Client.js";

function formatDuration(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
	if (minutes > 0) return `${minutes}m ${seconds}s`;
	return `${seconds}s`;
}

export class RadioStateManager {
	private client: SkyndalexClient;

	constructor(client: SkyndalexClient) {
		this.client = client;
	}

	setInstance(guildId: string, state: RadioInstanceState): void {
		this.client.radioInstances.set(guildId, state);
	}

	getInstance(guildId: string): RadioInstanceState {
		return <RadioInstanceState>this.client.radioInstances.get(guildId);
	}

	hasInstance(guildId: string): boolean {
		return this.client.radioInstances.has(guildId);
	}

	async deleteInstance(
		guildId: string,
		reason: "manual" | "auto" = "manual",
	): Promise<void> {
		const instance = this.getInstance(guildId);

		if (!instance) {
			console.warn(
				`[RadioStateManager] No instance found for guild ${guildId}`,
			);
			return;
		}

		this.client.radioInstances.delete(guildId);

		try {
			await this.client.shoukaku.leaveVoiceChannel(guildId);
			console.log(
				`[RadioStateManager] Left voice channel ${instance.voiceChannelId} in guild ${guildId}`,
			);
		} catch (error) {
			console.error(
				`[RadioStateManager] Error leaving voice channel for guild ${guildId}:`,
				error,
			);
		}

		try {
			this.client.dashboard?.broadcastRadioUpdate(guildId, "radio_updated");
		} catch (error) {
			console.error(`[RadioStateManager] Error broadcasting update:`, error);
		}

		if (reason === "auto" && instance.textChannelId) {
			try {
				const textChannel = await this.client.channels
					.fetch(instance.textChannelId)
					.catch(() => null);
				if (textChannel && typeof (textChannel as TextChannel).send === "function") {
					/*

	const guildId = interaction.guild.id;
	const channelId = voiceChannel.id;
	const now = Date.now();
	const totalsByUser = new Map<string, number>();

	for (const [key, totalMs] of client.voiceTotals) {
		const [storedGuildId, storedChannelId, storedUserId] = key.split(":");
		if (storedGuildId !== guildId || storedChannelId !== channelId) continue;
		totalsByUser.set(storedUserId, (totalsByUser.get(storedUserId) ?? 0) + totalMs);
	}

	for (const [sessionKey, session] of client.voiceSessions) {
		if (session.guildId !== guildId || session.channelId !== channelId) continue;
		const [, storedUserId] = sessionKey.split(":");
		const ongoingMs = Math.max(0, now - session.joinedAt);
		totalsByUser.set(
			storedUserId,
			(totalsByUser.get(storedUserId) ?? 0) + ongoingMs,
		);
	}

	const rows = [...totalsByUser.entries()]
		.filter(([, totalMs]) => totalMs > 0)
		.sort((a, b) => b[1] - a[1]);

	if (rows.length === 0) {
		return await interaction.reply({
			content: `No listening time data found for <#${channelId}> yet.`,
			ephemeral: true,
		});
	}

	const summary = rows
		.slice(0, 25)
		.map(
			([userId, totalMs]) =>
				`<@${userId}> listened for ${formatDuration(totalMs)}`,
		)
		.join("\n");

					 */
					const channelId = instance.voiceChannelId;
					const now = Date.now();
					const totalsByUser = new Map<string, number>();

					for (const [key, totalMs] of this.client.voiceTotals) {
						const [storedGuildId, storedChannelId, storedUserId] =
							key.split(":");
						if (storedGuildId !== guildId || storedChannelId !== channelId)
							continue;
						totalsByUser.set(
							storedUserId,
							(totalsByUser.get(storedUserId) ?? 0) + totalMs,
						);
					}

					for (const [sessionKey, session] of this.client.voiceSessions) {
						if (session.guildId !== guildId || session.channelId !== channelId)
							continue;
						const [, storedUserId] = sessionKey.split(":");
						const ongoingMs = Math.max(0, now - session.joinedAt);
						totalsByUser.set(
							storedUserId,
							(totalsByUser.get(storedUserId) ?? 0) + ongoingMs,
						);
					}
					const rows = [...totalsByUser.entries()]
						.filter(([, totalMs]) => totalMs > 0)
						.sort((a, b) => b[1] - a[1]);

					if (rows.length === 0) {
						await (textChannel as TextChannel).send({
							content: `No listening time data found for <#${channelId}> yet.`,
						});
						return;
					}
					const summary = rows
						.slice(0, 25)
						.map(
							([userId, totalMs]) =>
								`> <@${userId}> listened for ${formatDuration(totalMs)}`,
						)
						.join("\n");

					const message = `Auto disconnected: No users remained in <#${instance.voiceChannelId}> — the radio has been stopped.\n\n${summary}`;
					await (textChannel as TextChannel).send({ content: message });
				}
			} catch (error) {
				console.error(
					`[RadioStateManager] Error sending auto-disconnect message:`,
					error,
				);
			}
		}
	}

	async checkAndCleanupEmptyChannel(guildId: string): Promise<void> {
		const instance = this.getInstance(guildId);

		if (!instance) {
			return;
		}

		try {
			const guild = this.client.guilds.cache.get(guildId);
			if (!guild) {
				console.warn(
					`[RadioStateManager] Guild ${guildId} not found for empty channel check`,
				);
				return;
			}

			const voiceChannel = guild.channels.cache.get(instance.voiceChannelId);
			if (!voiceChannel?.isVoiceBased()) {
				console.log(
					`[RadioStateManager] Voice channel ${instance.voiceChannelId} was deleted, cleaning up radio instance`,
				);
				return;
			}

			const nonBotMembers = voiceChannel.members.filter(
				(member: GuildMember) =>
					!member.user.bot && member.id !== this.client.user?.id,
			);

			if (nonBotMembers.size === 0) {
				console.log(
					`[RadioStateManager] No users in voice channel ${instance.voiceChannelId}, cleaning up radio instance`,
				);
				await this.deleteInstance(guildId, "auto");
			}
		} catch (error) {
			console.error(
				`[RadioStateManager] Error checking empty channel for guild ${guildId}:`,
				error,
			);
		}
	}
}
