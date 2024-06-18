import type { SkyndalexClient } from "#classes";
import {
	PermissionFlagsBits,
	type MessageComponentInteraction,
} from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction<"cached">,
) {
	try {
		if (
			interaction.user.id !==
				interaction?.message?.interaction?.user?.id &&
			!interaction.member?.permissions.has(
				PermissionFlagsBits.ManageChannels,
			)
		)
			return interaction.reply({
				content: client.i18n.t("CANNOT_USE_BUTTON"),
				ephemeral: true,
			});

		await interaction.update({ files: [] });
	} catch (e) {
		console.error(e);
		interaction.editReply({
			content: "An error occurred!",
			components: [],
		});
	}
}
