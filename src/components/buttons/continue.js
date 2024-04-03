import { HfInference } from "@huggingface/inference";
import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
} from "discord.js";

const hf = new HfInference(process.env.HF_TOKEN);
export async function run(client, interaction) {
	const disabledButton = new ButtonBuilder()
		.setCustomId("nothing_more_to_continue")
		.setLabel("Nothing more to generate")
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(true);

	const previousContent = interaction.message.embeds[0].data.description;

	const isAuthor =
		interaction.message.interaction.user.id === interaction.user.id;

	if (!isAuthor) {
		return interaction.reply({
			content: "this is not your button :/",
			ephemeral: true,
		});
	}

	const newContent = await hf.textGeneration({
		model: "google/gemma-7b-it",
		inputs: previousContent,
	});

	const updatedActionRow = new ActionRowBuilder().addComponents(
		disabledButton,
	);

	if (previousContent === newContent.generated_text) {
		return interaction.update({ components: [updatedActionRow] });
	} else if (newContent.generated_text.length > 2000) {
		const file = new AttachmentBuilder()
		const embedTooLong = new EmbedBuilder()
			.setDescription(
				"The generated text is too long to be displayed here.",
			)
			.setColor("Yellow")

		await interaction.update({ embeds: [embedTooLong], files: [file] });
	} else {
		const newEmbed = new EmbedBuilder()
			.setDescription(newContent.generated_text)
			.setColor("#00ff00")

		if (interaction.message.embeds[0].data.color === 16705372) return;
		if (!interaction.replied || interaction.deferred)
			await interaction.update({ embeds: [newEmbed] });
	}
}
