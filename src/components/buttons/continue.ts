import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	type MessageComponentInteraction,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import type { HuggingFaceText } from "#types";

export async function run(
	_client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	try {
		if (interaction.user.id !== interaction?.message?.interaction?.user?.id)
			return interaction.reply({
				content: "You can't use this button!",
				ephemeral: true,
			});

		await interaction.deferUpdate();

		const model = "meta-llama/Meta-Llama-3-8B-Instruct";

		const message = interaction.message.embeds[0].description;

		const data = {
			inputs: message,
		};

		const response = await fetch(
			`https://api-inference.huggingface.co/models/${model}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.HF_TOKEN}`,
				},
				body: JSON.stringify(data),
			},
		);
		const json = (await response.json()) as HuggingFaceText[];

		const tooLong = new ButtonBuilder()
			.setLabel("Too long")
			.setStyle(ButtonStyle.Secondary)
			.setCustomId("tooLong")
			.setDisabled(true);

		const contentGenerated = new ButtonBuilder()
			.setLabel("This is all I got!")
			.setStyle(ButtonStyle.Secondary)
			.setCustomId("contentGenerated")
			.setDisabled(true);

		if (json[0].generated_text.length > 2000) {
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				tooLong,
			);
			return interaction.editReply({
				components: [row],
			});
		}

		if (json[0].generated_text === message) {
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				contentGenerated,
			);
			return interaction.editReply({
				components: [row],
			});
		}

		const embed = new EmbedBuilder()
			.setDescription(`${json[0].generated_text}`)
			.setColor("Blue");

		await interaction.editReply({
			embeds: [embed],
		});
	} catch (e) {
		console.error(e);
		interaction.editReply({
			content: "An error occurred!",
			components: [],
		});
	}
}
