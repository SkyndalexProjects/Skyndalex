import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
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

		console.log("Connecting to Gradio API...");

		const app = await Client.connect("linoyts/FramePack-F1", {
			hf_token: process.env.HF_TOKEN,
			timeout: 30000,
		});

		console.log(`Generating video with prompt: "${prompt}"`);

		const result = await app.predict("/process", {
			input_image: null,
			prompt: prompt,
			t2v: true,
			n_prompt: "Hello!!",
			seed: 3,
			total_second_length: 1,
			latent_window_size: 1,
			steps: 1,
			cfg: 1,
			gs: 1,
			rs: 0,
			gpu_memory_preservation: 8,
			use_teacache: true,
			mp4_crf: 0,
		});

		const api_info = await app.view_api();

		console.log("API Info:", api_info);
		console.log("APP Config:", app.config);
		console.log("API Response:", JSON.stringify(result, null, 2));

		if (result?.data?.[0]?.video?.url) {
			const videoUrl = result.data[0].video.url;
			console.log(`Video generated successfully: ${videoUrl}`);

			const response = await fetch(videoUrl);
			if (!response.ok) {
				throw new Error(`Failed to download video: ${response.statusText}`);
			}

			const arrayBuffer = await response.arrayBuffer();
			const videoBuffer = Buffer.from(arrayBuffer);

			const embed = new EmbedBuilder(client, interaction.locale)
				.setTitle(`Video Generated for: "${prompt}"`)
				.setColor("Blue")
				.setFooter({
					text: `Requested by ${interaction.user.username}`,
					iconURL: interaction.user.displayAvatarURL(),
				});

			await interaction.editReply({
				embeds: [embed],
				files: [
					{
						attachment: videoBuffer,
						name: "generated_video.mp4",
					},
				],
			});
		} else {
			console.error("No video data received:", result);
			await handleError(
				client,
				new Error("No video data received from the model."),
				interaction,
			);
		}
	} catch (error) {
		console.error("Video generation error:", error);
		await handleError(
			client,
			new Error("An error occurred while generating the video."),
			interaction,
		);
	}
}

export const data = new SlashCommandBuilder()
	.setName("genvid")
	.setDescription("Generate an video using AI!")
	.addStringOption((option) =>
		option
			.setName("prompt")
			.setDescription("Describe the image you want to generate")
			.setRequired(true),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
