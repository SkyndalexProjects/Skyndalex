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

	const embedRunning = new EmbedBuilder(client, interaction.locale)
		.setTitle("CUSTOM_BOT_MANAGE_TITLE")
		.setDescription("CUSTOM_BOT_CURRENT_DESC", {
			currentBot: bot.username,
			status: "running",
			botId: custombot.id,
		})
		.setColor("Yellow");

	const embedOn = new EmbedBuilder(client, interaction.locale)
		.setTitle("CUSTOM_BOT_MANAGE_TITLE")
		.setDescription("CUSTOM_BOT_CURRENT_DESC", {
			currentBot: bot.username,
			status: "working",
			botId: custombot.id,
			activity: custombot.activity,
		})
		.setColor("Green");

	const embedDestroyed = new EmbedBuilder(client, interaction.locale)
		.setTitle("CUSTOM_BOT_MANAGE_TITLE")
		.setDescription("CUSTOM_BOT_CURRENT_DESC", {
			currentBot: bot.username,
			status: "offline",
			botId: custombot.id,
		})
		.setColor("Red");

	try {
		if (!interaction.deferred && !interaction.replied) {
			await interaction.deferUpdate();
		}

		await client.custombots.updatePowerState(
			custombot.id.toString(),
			interaction.user.id,
			"launching",
		);

		await interaction.editReply({
			embeds: [embedRunning],
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
			);3

		actionRow.setComponents(
			new ButtonBuilder(client, interaction.locale)
				.setLabel("CUSTOM_BOT_POWER_STATE_OFF")
				.setStyle(ButtonStyle.Danger)
				.setCustomId(`customBotPowerState-${custombot.id}`),
		);

		await interaction.editReply({
			embeds: [embedOn],
			components: [interaction.message.components[0], actionRow],
		});

		const buttonComponent =
			interaction?.message?.components[1].components[0];

		// @ts-expect-error

		if (buttonComponent?.data?.style === ButtonStyle.Danger) {
			await client.custombots.updatePowerState(
				custombot.id.toString(),
				interaction.user.id,
				"launching",
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
				embeds: [embedDestroyed],
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
