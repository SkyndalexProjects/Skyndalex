import {
	type APIActionRowComponent,
	type APIButtonComponent,
	ActionRowBuilder,
	ButtonStyle,
	type MessageComponentInteraction,
} from "discord.js";
import { ButtonBuilder, EmbedBuilder } from "#builders";
import { SkyndalexClient } from "#classes";
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

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("CUSTOM_BOT_MANAGE_TITLE")
		.setDescription("CUSTOM_BOT_CURRENT_DESC", {
			currentBot: bot.username,
			botId: custombot.id,
			activity: custombot.activity,
		})
		.setColor("Yellow");

	try {
		if (!interaction.deferred && !interaction.replied) {
			await interaction.deferUpdate();
		}
		const instance = client.customInstances.get(
			`${interaction.user.id}-${custombot.id}`,
		);

		if (!instance) {
			const customClient = new SkyndalexClient(custombot.activity);

			client.logger.log(
				`(customBotPowertState): RUNNING custom bot ${bot.username} with id ${custombot.id} for user ${interaction.user.username} [${interaction.user.id}]`,
			);

			await customClient.init(custombot.token);

			await client.custombots.updatePowerState(
				custombot.id.toString(),
				interaction.user.id,
				"online",
			);

			client.customInstances.set(
				`${interaction.user.id}-${custombot.id}`,
				customClient,
			);
		}

		await interaction.editReply({
			embeds: [embed],
			components: [interaction.message.components[0]],
		});

		const actionRow: ActionRowBuilder<ButtonBuilder> =
			ActionRowBuilder.from(
				interaction.message
					.components[1] as APIActionRowComponent<APIButtonComponent>,
			);

		const buttonComponent = interaction?.message?.components[1]
			.components[0] as unknown as ButtonBuilder;

		if (buttonComponent?.data?.style === ButtonStyle.Danger) {
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

			client.logger.log(
				`(customBotPowerState): Turning OFF custom bot ${bot.username} with id ${custombot.id} for user ${interaction.user.username} [${interaction.user.id}]`,
			);
			await instance.destroy();
			await client.custombots.updatePowerState(
				custombot.id.toString(),
				interaction.user.id,
				"offline",
			);
			client.customInstances.delete(
				`${interaction.user.id}-${custombot.id}`,
			);
		} else {
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
