import {
	type Message,
	type BaseGuildTextChannel,
	ThreadAutoArchiveDuration,
	ChannelType,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import type { ChatbotMessageHistory, GroqResponse } from "#types";

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

	if (
		settings?.chatbotChannel &&
		settings.chatbotAPIKey &&
		message.channel.type === ChannelType.PublicThread &&
		message.channel.parentId === settings?.chatbotChannel
	) {
		if (!client.chatbotMessageHistory[message.channel.id]) {
			client.chatbotMessageHistory[message.channel.id] = [];
		}

		client.chatbotMessageHistory[message.channel.id].push({
			content: message.content,
			isBot: message.author.bot,
			createdTimestamp: message.createdAt,
		});
	}

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

		const response = await getChatbotResponse(
			apiUrl,
			settings,
			message.content,
			client.chatbotMessageHistory,
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
			}
		}
	}
}

async function getChatbotResponse(
	apiUrl: string,
	settings: any,
	content: string,
	history: ChatbotMessageHistory,
): Promise<string | null> {
	const messages: { role: string; content: string }[] = buildMessageHistory(
		history,
		content,
	);
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
		console.error("Error from chatbot API:", json.error.message);
		return null;
	}

	return json.choices[0]?.message?.content || null;
}

function buildMessageHistory(
	history: ChatbotMessageHistory,
	userContent: string,
): { role: string; content: string }[] {
	const messages: { role: string; content: string }[] = [];

	for (const key of Object.keys(history)) {
		for (const msg of history[key]) {
			const role = msg.isBot ? "assistant" : "user";
			if (
				!messages.some(
					(message) =>
						message.content === msg.content &&
						message.role === role,
				)
			) {
				messages.push({ role, content: msg.content });
			}
		}
	}

	if (
		!messages.some(
			(message) =>
				message.content === userContent && message.role === "user",
		)
	) {
		messages.push({ role: "user", content: userContent });
	}

	return messages;
}

async function analyzeImage(
	apiUrl: string,
	settings: any,
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
	const responseContent =
		content.length > maxLength
			? `${content.slice(0, maxLength - 3)} [...]`
			: content;
	await message.reply(responseContent);
}

async function createThreadAndReply(
	channel: BaseGuildTextChannel,
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
