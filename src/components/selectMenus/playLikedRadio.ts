import type { StringSelectMenuInteraction } from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: StringSelectMenuInteraction<"cached">,
) {
	const value = interaction.values[0];

	const memberChannel = interaction.member.voice.channel;

	if (!memberChannel) {
		return await interaction.reply({
			content: `${client.i18n.t("RADIO_JOIN_VOICE_CHANNEL", {
				lng: interaction.locale,
			})}`,
		});
	}

	const playRadio = await client.radio.startRadio(
		client,
		value,
		interaction.guild.id,
		memberChannel.id,
		interaction.user.id,
	);

	return interaction.reply({
		content: `▶️ Playing **${playRadio.json.data.title}**`,
		ephemeral: true,
	});
}
