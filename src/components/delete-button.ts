import { SkyndalexClient } from "../classes/index.js";
import { MessageComponentInteraction } from "discord.js";

export async function run(
	_client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	await interaction.update({
		content: `Image removed by ${interaction.user.username}.`,
		attachments: [],
		components: [],
	});
}
