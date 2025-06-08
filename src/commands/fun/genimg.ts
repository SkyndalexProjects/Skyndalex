import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	MediaGalleryBuilder,
	MessageFlags,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { Client } from "@gradio/client";
import { handleError } from "../../utils/index.js";
import { EmbedBuilder } from "../../classes/builders/index.js";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	try {
		await interaction.deferReply();

		const prompt = interaction.options.getString("prompt");

		const app = await Client.connect("NihalGazi/FLUX-Pro-Unlimited");

		const result = await app.predict("/generate_image", {
			prompt: prompt,
			width: 1024,
			height: 1024,
			seed: 3,
			randomize: true,
			server_choice: "Google US Server",
		});
		console.log("result", result.data);

		if (result && result.data && result.data[0]) {
			const embed = new EmbedBuilder(client, interaction.locale)
				.setTitle(`Image Generated for: "${prompt}"`)
				.setImage(result.data[0].url)
				.setColor("Blue")
				.setFooter({
					text: `Requested by ${interaction.user.username}`,
					iconURL: interaction.user.displayAvatarURL(),
				});
			await interaction.editReply({
				embeds: [embed],
			});
		} else {
			await handleError(
				client,
				new Error("No image data returned from the model."),
				interaction,
			);
		}
	} catch (error) {
		console.error("Image generation error:", error);

		if (interaction.deferred || interaction.replied) {
			await handleError(
				client,
				new Error("An error occurred while generating the image."),
				interaction,
			);
		} else {
			await handleError(
				client,
				new Error("An error occurred while generating the image."),
				interaction,
			);
		}
	}
}

export const data = new SlashCommandBuilder()
	.setName("genimg")
	.setDescription("Generate an image using AI!")
	.addStringOption((option) =>
		option
			.setName("prompt")
			.setDescription("Describe the image you want to generate")
			.setRequired(true),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
