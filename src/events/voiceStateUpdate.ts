import type { VoiceState } from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function voiceStateUpdate(
	client: SkyndalexClient,
	oldState: VoiceState,
	newState: VoiceState,
) {
	try {
		const userId = newState.id ?? oldState.id;
		const member = newState.member ?? oldState.member;
		const oldChannelId = oldState.channelId;
		const newChannelId = newState.channelId;
		const guildId = newState.guild.id;

		if (!member?.user.bot && oldChannelId !== newChannelId) {
			const sessionKey = `${guildId}:${userId}`;
			const now = Date.now();
			const previousSession = client.voiceSessions.get(sessionKey);

			if (previousSession) {
				const elapsed = Math.max(0, now - previousSession.joinedAt);
				const totalKey = `${previousSession.guildId}:${previousSession.channelId}:${userId}`;
				const currentTotal = client.voiceTotals.get(totalKey) ?? 0;
				client.voiceTotals.set(totalKey, currentTotal + elapsed);
				client.voiceSessions.delete(sessionKey);
			}

			if (newChannelId) {
				client.voiceSessions.set(sessionKey, {
					guildId,
					channelId: newChannelId,
					joinedAt: now,
				});
			}
		}

		const channel = oldState.channel || newState.channel;
		if (!channel) {
			return;
		}

		if (!client.radioStateManager.hasInstance(guildId)) {
			return;
		}

		const radioInstance = client.radioStateManager.getInstance(guildId);
		if (!radioInstance || radioInstance.voiceChannelId !== channel.id) {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 500));

		await client.radioStateManager.checkAndCleanupEmptyChannel(guildId);
	} catch (error) {
		console.error("[voiceStateUpdate] Error handling voice state:", error);
	}
}
