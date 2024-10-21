import type {
	BaseGuildTextChannel,
	ChatInputCommandInteraction,
	MessageComponentInteraction,
	ModalSubmitInteraction,
} from "discord.js";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";

export async function handleError(
	client: SkyndalexClient,
	error: Error,
	interaction:
		| ChatInputCommandInteraction
		| ModalSubmitInteraction
		| MessageComponentInteraction,
) {
	client.imageQueue.delete(`${interaction.user.id}-${interaction.guildId}`);
	
	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle(`${error.message}`)
		.setDescription(`\`\`\`js\n${error.stack}\`\`\``)
		.setColor("Red")
		.setFooter({
			text: `Guild: ${interaction.guild.name} [${interaction.guild.id}] | User: ${interaction.user.username} [${interaction.user.id}] `,
			iconURL: client.user.displayAvatarURL(),
		});

	(
		client.channels.cache.get("1283484199898189906") as BaseGuildTextChannel
	).send({ embeds: [embed] });

	const embedError = new EmbedBuilder(client, interaction.locale)
		.setDescription("SYSTEM_ERROR_SENT")
		.setColor("Red");

	if (!interaction.deferred && !interaction.replied) {
		await interaction.reply({
			embeds: [embedError],
			components: [],
			files: [],
		});
	} else {
		await interaction.editReply({
			embeds: [embedError],
			components: [],
			files: [],
		});
	}
}
