import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	MessageFlags,
	ButtonBuilder,
	ButtonStyle,
	TextDisplayBuilder,
	ContainerBuilder,
	ActionRowBuilder,
	AttachmentBuilder,
	type User,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { Client } from "@gradio/client";
import * as process from "node:process";
import { handleError } from "../../utils/index.js";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();
	const prompt = interaction.options.getString("prompt");
	const getDiscordAccounts = await client.prisma.account.findFirst({
		where: {
			accountId: interaction.user.id,
			providerId: "discord",
		},
	});
	if (getDiscordAccounts) {
		const getHuggingfaceAccount = await client.prisma.account.findFirst({
			where: {
				userId: getDiscordAccounts.userId,
				providerId: "huggingface",
			},
		});
		const authorizeButton = new ButtonBuilder()
			.setLabel("Authorize")
			.setStyle(ButtonStyle.Link)
			.setURL(
				process.env.OAUTH_TO_HUGGINGFACE ?? "https://default-auth-url.com",
			);
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			authorizeButton,
		);

		const container = new ContainerBuilder()
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent("\**Authorization required.\*"),
			)
			.setAccentColor(0xffff00);

		if (
			!getHuggingfaceAccount ||
			!getHuggingfaceAccount.accessToken ||
			getHuggingfaceAccount.accessToken.length <= 0
		) {
			return interaction.editReply({
				flags: MessageFlags.IsComponentsV2,
				components: [container, row],
			});
		}
		const mentionRegex = /<@!?(\d+)>/g;
		interface mentionedUser {
			id: string;
			username: string;
			displayName?: string;
			globalName?: string;
			bot: boolean;
			accentColor?: number | null;
			mention: string;
		}
		let maxMentions = 3;
		const mentionedUsers: mentionedUser[] = [];
		let senderInfo;
		let mentionContext = "";
		let limitReached = false;
		let systemPrompt = `You are a helpful assistant on the Discord platform.
${mentionContext}
Message sender information: ${JSON.stringify(senderInfo)}
Any other users: ${mentionedUsers.length > 0 ? JSON.stringify(mentionedUsers) : "None"}
Context: You are responding to a message from user ${interaction.user.username} on a Discord server.
If there are mentions of other users in the message, you can refer to them using their names.
Respond in a friendly and helpful manner, maintaining the context of the Discord platform. You are not associated with Discord or any other company.`;

		if (prompt) {
			const allMatches = Array.from(prompt.matchAll(mentionRegex));
			limitReached = allMatches.length > maxMentions;
			const limitedMatches = allMatches.slice(0, maxMentions);
			for (const match of limitedMatches) {
				const userId = match[1];
				try {
					const user = await client.users.fetch(userId);

					if (user.id !== interaction.user.id) {
						senderInfo = {
							id: interaction.user.id,
							username: interaction.user.username,
							displayName:
								interaction.user.displayName || interaction.user.username,
							globalName:
								interaction.user.globalName || interaction.user.username,
							bot: interaction.user.bot,
							accentColor: interaction.user.accentColor,
							mention: `<@${interaction.user.id}>`,
						};
					}

					if (user) {
						mentionedUsers.push({
							id: user.id,
							username: user.username,
							displayName: user.displayName || user.username,
							globalName: user.globalName || user.username,
							bot: user.bot,
							accentColor: user.accentColor,
							mention: `<@${user.id}>`,
						});
					}
				} catch (error: unknown) {
					await handleError(client, new Error(String(error)), interaction);
					console.error(
						`Could not fetch user information for ID ${userId}:`,
						error,
					);
				}
			}

			if (mentionedUsers.length > 0) {
				mentionContext = `Information about mentioned users: ${JSON.stringify(mentionedUsers)}\n`;
			}
		}

		if (!interaction.guild) {
			maxMentions = 1;
			senderInfo = {
				id: interaction.user.id,
				username: interaction.user.username,
				displayName: interaction.user.displayName || interaction.user.username,
				globalName: interaction.user.globalName || interaction.user.username,
				bot: interaction.user.bot,
				accentColor: interaction.user.accentColor,
				mention: `<@${interaction.user.id}>`,
			};
			systemPrompt = `You are a helpful assistant on the Discord platform.
${mentionContext}
Message sender information: ${JSON.stringify(senderInfo)}
Context: You are responding to a message from user ${interaction.user.username} on a Discord private message with other user, which you dont have access. If the user wants to know basic info, he must mention them in the prompt
If there are mentions of other users in the message, you can refer to them using their names.
Respond in a friendly and helpful manner, maintaining the context of the Discord platform. You are not associated with Discord or any other company.`;
		}

		const app = await Client.connect("huggingface-projects/gemma-3n-E4B-it", {
			hf_token: getHuggingfaceAccount?.accessToken,
		}).catch((error: Error) => {
			console.error("Error connecting to HuggingFace:", error);
			return interaction.editReply({
				flags: MessageFlags.IsComponentsV2,
				components: [container, row],
			});
		});

		console.log("Prompt", prompt);
		console.log("System prompt", systemPrompt);
		const result = await app
			.predict("/chat", {
				message: { text: prompt },
				system_prompt: systemPrompt,
				max_new_tokens: 500,
			})
			.catch((error: Error) => {
				console.error("Error during prediction:", error);
				handleError(client, error, interaction);
			});

		console.log("Data", result);

		await interaction.editReply({
			content: `${result?.data[0]}\n-# Prompt: *${prompt}*`,
		});
	}
}

export const data = new SlashCommandBuilder()
	.setName("chat")
	.setDescription("Chat with ai.")
	.addStringOption((option) =>
		option
			.setName("prompt")
			.setDescription("Describe the image you want to generate")
			.setRequired(true),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
