import {
	type Message,
	type BaseGuildTextChannel,
	ThreadAutoArchiveDuration,
	ChannelType,
	Collection,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import type { GroqResponse } from "#types";

export async function messageCreate(client: SkyndalexClient, message: Message) {
	const settings = await client.prisma.settings.findFirst({
		where: { guildId: message.guild.id },
	});

	if (
		!settings?.chatbotChannel ||
		!settings?.chatbotAPIKey ||
		message.author.bot
	)
		return;

	const isChatbotChannel = message.channel.id === settings.chatbotChannel;
	const apiUrl = "https://api.groq.com/openai/v1/chat/completions";
	const maxLength = 2000;

	if (isChatbotChannel || message.channel.type === ChannelType.PublicThread) {
		const channel = message.channel as BaseGuildTextChannel;
		channel.sendTyping();

		let response: string | null = null;

		if (
			message.channel.type === ChannelType.PublicThread &&
			message.channel.ownerId === client.user.id
		) {
			if (message.author.bot) return;
			const messages = await message.channel.messages.fetch({
				limit: 100,
			});

			response = await getChatbotResponse(
				apiUrl,
				settings,
				message.content,
				messages,
			);
		} else {
			response = await getChatbotResponse(
				apiUrl,
				settings,
				message.content,
			);
		}

		if (!response) return;

		if (
			message.attachments.size > 0 &&
			isValidImage(message.attachments.first()?.contentType)
		) {
			const imageContent = await analyzeImage(
				apiUrl,
				settings,
				response,
				new URL(message.attachments.first()!.url),
			);

			await sendResponse(
				message,
				imageContent || "I couldn't analyze this image.",
				maxLength,
			);
		} else {
			await sendResponse(message, response, maxLength);
		}

		if (isChatbotChannel && message.reference?.messageId) {
			const referencedMessage = await message.channel.messages.fetch(
				message.reference.messageId,
			);
			if (referencedMessage.author.id === client.user.id) {
				await createThreadAndReply(channel, message, response);
			}
		}
	}
}

interface Settings {
	chatbotAPIKey: string;
	chatBotSystemPrompt?: string;
	chatBotMaxTokens?: number;
	chatBotTemperature?: number;
	chatbotChannel?: string;
}

async function getChatbotResponse(
	apiUrl: string,
	settings: Settings,
	content: string,
	history?: Collection<string, Message<true>>,
): Promise<string | null> {
	const messages = history
		? history
				.filter((msg) => !msg.author.bot)
				.sort((a, b) => a.createdTimestamp - b.createdTimestamp)
				.map((msg) => ({
					role: "user",
					content: msg.content,
				}))
		: [
				{
					role: "user",
					content: content,
				},
			];

	const response = await fetch(apiUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${settings.chatbotAPIKey}`,
		},
		body: JSON.stringify({
			model: "llama3-70b-8192",
			messages,
			max_tokens: settings?.chatBotMaxTokens,
			temperature: settings?.chatBotTemperature,
		}),
	});

	const json = (await response.json()) as GroqResponse;
	if (json.error) {
		return json.error.message;
	}

	return json.choices[0]?.message?.content;
}

async function analyzeImage(
	apiUrl: string,
	settings: Settings,
	content: string,
	attachment: URL,
): Promise<string | null> {
	const response = await fetch(apiUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${settings.chatbotAPIKey}`,
		},
		body: JSON.stringify({
			model: "llama-3.2-11b-vision-preview",
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: content || "What is this image?",
						},
						{
							type: "image_url",
							image_url: {
								url: attachment,
							},
						},
					],
				},
				{
					role: "assistant",
					content:
						"Describe the image in the image above. Adjust your description to the user's input language.",
				},
			],
			max_tokens: 2048,
		}),
	});

	const json = (await response.json()) as GroqResponse;
	if (json.error)
		return `Oops! I couldn't analyze this image. Full error: \`${json.error.message}\``;

	return json.choices[0]?.message?.content;
}

async function sendResponse(
	message: Message,
	content: string,
	maxLength: number,
) {
	if (content.length > maxLength) {
		await message.reply(`${content.slice(0, maxLength - 3)} [...]`);
	} else {
		await message.reply(content);
	}
}

async function createThreadAndReply(
	channel: BaseGuildTextChannel,
	message: Message,
	content: string,
) {
	let threadName =
		message.content.slice(0, 50) +
		(message.content.length > 50 ? "[...]" : "");
	const thread = await channel.threads.create({
		name: threadName,
		autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
		reason: "IS THAT CLYDE?",
	});

	await thread.send(content);
}

function isValidImage(contentType: string | null): boolean {
	return ["image/png", "image/jpeg", "image/jpg"].includes(contentType || "");
}
