import type { SkyndalexClient } from "#classes";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	type Message,
	MessageFlags,
	TextDisplayBuilder,
} from "discord.js";
import { Client } from "@gradio/client";
import process from "node:process";
import type { HuggingfaceRouterData } from "#types";
import { Response } from "express";
export async function messageCreate(client: SkyndalexClient, message: Message) {
	if (client.user && message.mentions.has(client.user.id)) {
		const prompt = message.content;
		const getToken = await client.prisma.tokens.findUnique({
			where: {
				userId: message.author.id,
			},
		});

		if ("sendTyping" in message.channel) {
			await message.channel.sendTyping();
		}
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
				new TextDisplayBuilder().setContent(
					"The token you were using is already used up. To use the command again, you must log in via Huggingface. It is **free**, Skyndalex is in no way associated with this platform.",
				),
			)
			.setAccentColor(0xffff00);

		const result = await fetch(
			"https://router.huggingface.co/novita/v3/openai/chat/completions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${getToken?.huggingFaceToken}`,
				},
				body: JSON.stringify({
					model: "deepseek/deepseek-v3-0324",
					messages: [
						{
							role: "system",
							content:
								"Jesteś pomocnym asystentem Skyndalex, który odpowiada na pytania użytkowników w sposób zwięzły i przyjazny.",
						},
						{ role: "user", content: prompt },
					],
					max_tokens: 2048,
					temperature: 1,
					provider: "auto",
				}),
			},
		).catch((error: Error) => {
			if (error) {
				return message.reply({
					flags: MessageFlags.IsComponentsV2,
					components: [container, row],
				});
			}
		});
		if (!result) {
			return await message.reply(
				"Sorry, an error occurred while processing your request.",
			);
		}
		if ("json" in result) {
			const data = (await result.json()) as HuggingfaceRouterData;
			if (data?.error) {
				return message.reply({
					flags: MessageFlags.IsComponentsV2,
					components: [container, row],
				});
			}

			if (Array.isArray(data.choices)) {
				const content = data.choices[0].message.content;
				const trimmedContent = content.trim().replace(/\s{2,}/g, " ");

				const truncationMessage = "\n\n[...]";
				const maxLength = 2000 - truncationMessage.length;

				let finalContent = trimmedContent;
				if (trimmedContent.length > maxLength) {
					finalContent =
						trimmedContent.substring(0, maxLength) + truncationMessage;
				}

				await message.reply(finalContent || "Sorry, no response");
			} else {
				await message.reply(
					"Sorry, an error occurred while processing your request.",
				);
			}
		}
	}
}
