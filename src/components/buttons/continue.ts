import type { ButtonInteraction } from "discord.js";
import type { SkyndalexClient } from "../../classes/Client";

export async function run(
	client: SkyndalexClient,
	interaction: ButtonInteraction,
) {
	return interaction.reply({ content: ":heart:", ephemeral: true });
}
