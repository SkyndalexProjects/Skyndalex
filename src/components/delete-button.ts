import { SkyndalexClient } from "../classes/index.js";
import { MessageComponentInteraction } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	if (
		interaction.user.id !== interaction?.message?.interactionMetadata?.user?.id
	)
		return interaction.reply({
			content: "Its not your button!",
		});

	const attachment = interaction.message.attachments.first();
	if (!attachment) {
		return interaction.reply({
			content: "No attachment found to delete.",
			ephemeral: true,
		});
	}

	await interaction.update({
		content: `~~${interaction.message.content}~~\n\n- *Attachment deleted by ${interaction.user.username}*`,
		attachments: [],
		components: [],
	});
}
