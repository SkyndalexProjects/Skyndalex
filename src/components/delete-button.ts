import type { MessageComponentInteraction } from "discord.js";
import type { SkyndalexClient } from "../classes/index.js";

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
