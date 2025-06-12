import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import process from "node:process";
import type { TrackResult } from "shoukaku";
import path from "node:path";
import fs from "node:fs/promises";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();
	if (!interaction.guild) {
		await interaction.editReply("This command can only be used in a server.");
		return;
	}

	const member = interaction.member;

	if (!member || !("voice" in member) || !member.voice.channel) {
		await interaction.followUp(
			"You must be in a voice channel to use this command.",
		);
		return;
	}
	const apiUrl = "https://api.groq.com/openai/v1/audio/speech";
	const response = await fetch(apiUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.GROQ}`,
		},
		body: JSON.stringify({
			model: "playai-tts",
			voice: interaction.options.getString("voice"),
			input: interaction.options.getString("prompt"),
			response_format: "wav",
		}),
	});

	if (!response.ok) {
		const json = (await response?.json()) as {
			error?: {
				message: string;
				type: string;
				code: string;
			};
		};
		console.log("[Bot] :: Response from Groq API:", json);

		if (json.error) return interaction.editReply(json.error.message);
	}

	const node = client.shoukaku.options.nodeResolver(client.shoukaku.nodes);
	if (!node) {
		await interaction.editReply("No Lavalink node available.");
		return;
	}

	const player = await client.shoukaku.joinVoiceChannel({
		guildId: interaction.guild.id,
		channelId: member.voice.channel.id,
		shardId: 0,
	});
	setTimeout(
		() => client.shoukaku.leaveVoiceChannel(player.guildId),
		30000,
	).unref();

	const buffer = Buffer.from(await response.arrayBuffer());
	if (!buffer || buffer.length === 0) {
		await interaction.editReply("Failed to generate audio.");
		return;
	}

	const base64 = buffer.toString("base64");
	const dataUri = `data:audio/wav;base64,${base64}`;

	try {
		// const result = (await player.node.rest.resolve(
		//     dataUri,
		// )) as TrackResult;
		const result = (await node.rest.resolve(dataUri)) as TrackResult;
		if (!result?.tracks.length) return;
		const metadata = result.tracks.shift();

		await player.playTrack({ track: { encoded: metadata.encoded } });

		await interaction.editReply("Playing audio in your voice channel.");
	} catch (error) {
		console.error("[Bot] :: Error playing audio:", error);
		await interaction.editReply(
			"An error occurred while trying to play the audio.",
		);
	}
}

export const data = new SlashCommandBuilder()
	.setName("talk")
	.setDescription("Talk with AI on voice channel")
	.addStringOption((option) =>
		option
			.setName("prompt")
			.setDescription("What should I talk?")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("voice")
			.setDescription("Select AI voice to use")
			.addChoices(
				{ name: "Arista-PlayAI", value: "Arista-PlayAI" },
				{ name: "Atlas-PlayAI", value: "Atlas-PlayAI" },
				{ name: "Basil-PlayAI", value: "Basil-PlayAI" },
				{ name: "Briggs-PlayAI", value: "Briggs-PlayAI" },
				{ name: "Calum-PlayAI", value: "Calum-PlayAI" },
				{ name: "Celeste-PlayAI", value: "Celeste-PlayAI" },
				{ name: "Cheyenne-PlayAI", value: "Cheyenne-PlayAI" },
				{ name: "Chip-PlayAI", value: "Chip-PlayAI" },
				{ name: "Cillian-PlayAI", value: "Cillian-PlayAI" },
				{ name: "Deedee-PlayAI", value: "Deedee-PlayAI" },
				{ name: "Fritz-PlayAI", value: "Fritz-PlayAI" },
				{ name: "Gail-PlayAI", value: "Gail-PlayAI" },
				{ name: "Indigo-PlayAI", value: "Indigo-PlayAI" },
				{ name: "Mamaw-PlayAI", value: "Mamaw-PlayAI" },
				{ name: "Mason-PlayAI", value: "Mason-PlayAI" },
				{ name: "Mikail-PlayAI", value: "Mikail-PlayAI" },
				{ name: "Mitch-PlayAI", value: "Mitch-PlayAI" },
				{ name: "Quinn-PlayAI", value: "Quinn-PlayAI" },
				{ name: "Thunder-PlayAI", value: "Thunder-PlayAI" },
			),
	);
