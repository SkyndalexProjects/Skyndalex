import { type ColorResolvable, EmbedBuilder } from "discord.js";

export async function voiceStateUpdate(client, oldState, newState) {
	let description = "";
	let color = "";

	const embed = new EmbedBuilder().setTimestamp();

	if (oldState.channel !== newState.channel) {
		if (!oldState.channel && newState.channel) {
			description = `User ${newState.member.user.username} **joined channel** <#${newState.channel.id}> \`[${newState.channel.name}]\``;
			color = "Green";
		} else if (oldState.channel && !newState.channel) {
			description = `User ${newState.member.user.username} **left channel** <#${oldState.channel.id}> \`[${oldState.channel.name}]\``;
			color = "Green";
		} else {
			description = `User ${newState.member.user.username} **moved from** <#${oldState.channel.id}> \`[${newState.channel.name}]\` to <#${newState.channel.id}> [${newState.channel.name}]`;
			color = "Yellow";
		}
	} else {
		const availableStateKeys = {
			serverDeaf: "defeaned (by admin)",
			serverMute: "muted (by admin)",
			selfDeaf: "deafened",
			selfMute: "muted",
			selfVideo: "started video",
		};
		for (const key in availableStateKeys) {
			if (oldState[key] !== newState[key]) {
				embed.setDescription(
					`User ${newState.member.user.username} was **${
						newState[key] ? "un" : ""
					}${availableStateKeys[key]}** in \`${
						oldState.channel.name
					}\``,
				);
			}
		}
	}

	if (description) {
		embed.setDescription(description);
		embed.setColor(color as ColorResolvable);

		client.channels.cache
			.get("1071407744894128178")
			.send({ embeds: [embed] }); // channel id hardcoded temporary
	}
}
