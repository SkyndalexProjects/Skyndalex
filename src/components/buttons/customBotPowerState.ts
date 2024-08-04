import { SkyndalexClient } from "#classes";
import { ButtonBuilder, EmbedBuilder } from "#builders";
import {
	type MessageComponentInteraction,
	APIActionRowComponent,
	APIButtonComponent,
	ActionRowBuilder,
	ButtonStyle,
} from "discord.js";
const customInstances = new Map<string, SkyndalexClient>();
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
			status: custombot.status,
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

		client.custombots.init(custombot.clientId, custombot.token);

		const actionRow: ActionRowBuilder<ButtonBuilder> =
			ActionRowBuilder.from(
				interaction.message
					.components[1] as APIActionRowComponent<APIButtonComponent>,
			);

		if (custombot.status === "offline") {
			await client.custombots.updatePowerState(
				custombot.id.toString(),
				interaction.user.id,
				"working",
			);

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
		} else {
			const buttonComponent = interaction?.message?.components[1]
				.components[0] as unknown as ButtonBuilder;

			if (buttonComponent?.data?.style === ButtonStyle.Danger) {
				customInstances.delete(custombot.id.toString());
				await client.custombots.updatePowerState(
					custombot.id.toString(),
					interaction.user.id,
					"offline",
				);

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
			}
		}
	} catch (e) {
		console.error(e);
		await client.custombots.updatePowerState(
			custombot.id.toString(),
			interaction.user.id,
			"error",
		);
	}
}
