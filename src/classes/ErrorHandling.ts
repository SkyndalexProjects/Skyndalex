import type {
	BaseGuildTextChannel,
	ChatInputCommandInteraction,
	MessageComponentInteraction,
	ModalSubmitInteraction,
} from "discord.js";
import {
	Colors,
	ContainerBuilder,
	MessageFlags,
	SeparatorBuilder,
	TextDisplayBuilder,
} from "discord.js";
import type { SkyndalexClient } from "./Client.js";

export class ErrorHandling {
	async handleUnexpectedError(
		client: SkyndalexClient,
		error: Error,
		interaction:
			| ChatInputCommandInteraction
			| ModalSubmitInteraction
			| MessageComponentInteraction,
	) {
		await this.sendLog(client, error, interaction);

		const userContainer = new ContainerBuilder()
			.setAccentColor(Colors.Red)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent("SYSTEM_ERROR_SENT"),
			);

		if (interaction && typeof interaction.reply === "function") {
			if (!interaction.deferred && !interaction.replied) {
				await interaction.reply({
					components: [userContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			} else if (typeof interaction.editReply === "function") {
				await interaction.editReply({
					components: [userContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}
	}

	async handleComponentError(
		client: SkyndalexClient,
		error: Error,
		interaction: MessageComponentInteraction,
	) {
		await this.sendLog(client, error, interaction);

		const errorContainer = new ContainerBuilder()
			.setAccentColor(Colors.Red)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					"> An error occurred while processing the component. Reported.",
				),
			);

		const payload = {
			components: [errorContainer],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		};

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp(payload).catch(console.error);
		} else {
			await interaction.reply(payload).catch(console.error);
		}
	}

	private async sendLog(
		client: SkyndalexClient,
		error: Error,
		interaction:
			| ChatInputCommandInteraction
			| ModalSubmitInteraction
			| MessageComponentInteraction,
	) {
		const logContainer = new ContainerBuilder()
			.setAccentColor(Colors.Red)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`### ${error?.message || "Unknown error"}`,
				),
			)
			.addSeparatorComponents(new SeparatorBuilder())
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`\`\`\`js\n${(error?.stack ?? "no stack trace").slice(0, 3500)}\`\`\``,
				),
			)
			.addSeparatorComponents(new SeparatorBuilder())
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`-# Guild: ${interaction.guild?.name} [${interaction.guild?.id}] | User: ${interaction.user?.username} [${interaction?.user?.id}]`,
				),
			);

		const logChannel = client.channels.cache.get(
			String(process.env.LOG_CHANNEL_ID),
		) as BaseGuildTextChannel | undefined;

		if (logChannel) {
			await logChannel.send({
				components: [logContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
