import {
	type BaseGuildTextChannel,
	ChannelType,
	type Message,
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

	if (
		isChatbotChannel ||
		(message.channel.type === ChannelType.PublicThread &&
			message.channel.parentId === settings?.chatbotChannel)
	) {
		const channel = message.channel as BaseGuildTextChannel;
		channel.sendTyping();

		let history = Array.from(message.channel.messages.cache.values())
			.sort((a, b) => a.createdTimestamp - b.createdTimestamp)
			.map((msg) => ({
				role: msg.author.bot ? "assistant" : "user",
				content: msg.content,
			}));

		if (
			message.channel.type === ChannelType.PublicThread &&
			message.channel.parent.id === settings?.chatbotChannel
		) {
			const threadMessages = Array.from(
				message.channel.messages.cache.values(),
			)
				.sort((a, b) => a.createdTimestamp - b.createdTimestamp)
				.slice(-10);
			const threadHistory = [
				{
					role: "system",
					content: settings.chatBotSystemPrompt,
				},
				...threadMessages.map((msg) => ({
					role: msg.author.bot ? "system" : "user",
					content: msg.content,
				})),
			];
			history = threadHistory;
		} else {
			history = [
				{
					role: "user",
					content: message.content,
				},
				{
					role: "system",
					content: settings.chatBotSystemPrompt,
				},
			];
		}

		const response = await getChatbotResponse(
			apiUrl,
			settings,
			message.content,
			history,
		);
		if (!response) return;

		if (
			message.attachments.size > 0 &&
			isValidImage(message.attachments.first()?.contentType)
		) {
			const imageResponse = await analyzeImage(
				apiUrl,
				settings,
				response,
				new URL(message.attachments.first()?.url),
			);
			await sendResponse(
				message,
				imageResponse || "I couldn't analyze this image.",
				maxLength,
			);
		} else {
			if (!message.reference)
				await sendResponse(message, response, maxLength);
		}
		if (isChatbotChannel && message.reference?.messageId) {
			const referencedMessage = await message.channel.messages.fetch(
				message.reference.messageId,
			);
			if (referencedMessage.author.id === client.user.id) {
				await createThreadAndReply(channel, message, response);
			} else {
				await referencedMessage.reply(response);
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
	_content: string,
	history?: Array<{ role: string; content: string }>,
): Promise<string | null> {
	const response = await fetch(apiUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${settings.chatbotAPIKey}`,
		},
		body: JSON.stringify({
			model: "llama3-70b-8192",
			messages: history,
			max_tokens: settings?.chatBotMaxTokens,
			temperature: settings?.chatBotTemperature,
		}),
	});

	const json = (await response.json()) as GroqResponse;

	console.log("Chatbot response:", json);
	if (json.error) {
		console.error("Error from chatbot API:", json.error.message);
		return null;
	}

	return json.choices[0]?.message?.content || null;
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
							image_url: { url: attachment.toString() },
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
	if (json.error) {
		console.error("Error analyzing image:", json.error.message);
		return null;
	}

	return json.choices[0]?.message?.content || null;
}

async function sendResponse(
	message: Message,
	content: string,
	maxLength: number,
) {
	if (content.length > maxLength) {
		const buffer = Buffer.from(content, "utf-8");
		await message.reply({
			content: "The response is too long to send in a single message. Here is a file:",
			files: [
				{
					attachment: buffer,
					name: "skyndalex-chatbot-response.txt",
				},
			],
		});
	} else {
		message.reply(content);
	}
}

async function createThreadAndReply(
	_channel: BaseGuildTextChannel,
	message: Message,
	content: string,
) {
	const threadName = `${message.content.slice(0, 50)}${
		message.content.length > 50 ? "[...]" : ""
	}`;

	const thread = await message.startThread({
		name: threadName,
		autoArchiveDuration: 60,
	});

	await thread.send(content);
}

function isValidImage(contentType: string | null): boolean {
	return ["image/png", "image/jpeg", "image/jpg"].includes(contentType || "");
}
