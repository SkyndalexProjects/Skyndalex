import {
	type APIActionRowComponent,
	type APIButtonComponent,
	ActionRowBuilder,
	ButtonStyle,
	type MessageComponentInteraction,
} from "discord.js";
import find from "find-process";
import { ButtonBuilder, EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";
export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	const custombotId = interaction.customId.split("-")[1];

	const custombot = await client.custombots.findCustomBot(
		custombotId,
		interaction.user.id,
	);

	const bot = await client.users.fetch(custombot.clientId);

	client.logger.log(
		`(customBotPowertState): Running custom bot ${bot.username} with id ${custombot.id} for user ${interaction.user.username} [${interaction.user.id}]`,
	);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("CUSTOM_BOT_MANAGE_TITLE")
		.setDescription("CUSTOM_BOT_CURRENT_DESC", {
			currentBot: bot.username,
			botId: custombot.id,
		})
		.setColor("Yellow");

	try {
		if (!interaction.deferred && !interaction.replied) {
			await interaction.deferUpdate();
		}
		await interaction.editReply({
			embeds: [embed],
			components: [interaction.message.components[0]],
		});

		const bot = await find("name", `customBot ${custombot.clientId}`);

		const actionRow: ActionRowBuilder<ButtonBuilder> =
			ActionRowBuilder.from(
				interaction.message
					.components[1] as APIActionRowComponent<APIButtonComponent>,
			);

		if (bot[0]?.pid) {
			// TURNING OFF

			actionRow.setComponents(
				new ButtonBuilder(client, interaction.locale)
					.setLabel("CUSTOM_BOT_POWER_STATE_ON")
					.setStyle(ButtonStyle.Success)
					.setCustomId(`customBotPowerState-${custombot.id}`),
			);

			await interaction.editReply({
				embeds: [embed],
				components: [interaction.message.components[0], actionRow],
			});

			await process.kill(bot[0].pid);
		} else {
			client.custombots.init(custombot.clientId, custombot.token);

			actionRow.setComponents(
				new ButtonBuilder(client, interaction.locale)
					.setLabel("CUSTOM_BOT_POWER_STATE_OFF")
					.setStyle(ButtonStyle.Danger)
					.setCustomId(`customBotPowerState-${custombot.id}`),
			);

			await interaction.editReply({
				embeds: [embed],
				components: [interaction.message.components[0], actionRow],
			});
		}
	} catch (e) {
		console.error(e);
	}
}
