import { SkyndalexClient } from "#classes";
import { ButtonBuilder, EmbedBuilder } from "#builders";
import {
	Client,
	GatewayIntentBits,
	Partials,
	ActivityType,
	type MessageComponentInteraction,
	ActionRowBuilder,
	ButtonStyle,
	APIActionRowComponent,
	APIButtonComponent,
} from "discord.js";

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

		const customClient = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildVoiceStates,
			],
			partials: [Partials.Message],
			allowedMentions: { repliedUser: false },
			presence: {
				activities: [
					{
						name: custombot.activity,
						type: ActivityType.Playing,
					},
				],
			},
		});

		customClient.login(custombot.token);

		await client.custombots.updatePowerState(
			custombot.id.toString(),
			interaction.user.id,
			"working",
		);

		const actionRow: ActionRowBuilder<ButtonBuilder> =
			ActionRowBuilder.from(
				interaction.message
					.components[1] as APIActionRowComponent<APIButtonComponent>,
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

		const buttonComponent = interaction?.message?.components[1]
			.components[0] as unknown as ButtonBuilder;

		if (buttonComponent?.data?.style === ButtonStyle.Danger) {
			await client.custombots.updatePowerState(
				custombot.id.toString(),
				interaction.user.id,
				"offline",
			);
			await customClient.destroy();
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
	} catch (e) {
		console.error(e);
		await client.custombots.updatePowerState(
			custombot.id.toString(),
			interaction.user.id,
			"error",
		);
	}
}
