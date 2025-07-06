import { SkyndalexClient } from "../classes/index.js";
import { MessageComponentInteraction } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	if (
		interaction.user.id !== interaction?.message?.interactionMetadata?.user?.id
	)
		return interaction.followUp({
			content: "Its not your button!",
			flags: 64,
		});

	const attachment = interaction.message.attachments.first();
	if (!attachment) {
		return interaction.reply({
			content: "No attachment found to delete.",
			flags: 64,
		});
	}

	await interaction.update({
		content: `~~${interaction.message.content}~~\n\n- *Attachment deleted by ${interaction.user.username}*`,
		attachments: [],
		components: [],
	});
}
