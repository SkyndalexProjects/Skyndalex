import type { SkyndalexClient } from "#classes";
import { deploy } from "#utils";
import { type Message } from "discord.js";
import * as process from "node:process";

interface GroqResponse {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: Array<{
		index: 0;
		message: {
			content: string;
			role: string;
		};
		logprobs: null;
		finish_reason: string;
	}>;
	error: {
		message: string;
		type: string;
		code: string;
	};
}

export async function messageCreate(client: SkyndalexClient, message: Message) {
	if (client.user && message.mentions.has(client.user.id)) {
		const prompt = message.content;
		const apiUrl = "https://api.groq.com/openai/v1/chat/completions";
		const history = [];

		const response = await fetch(apiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.GROQ}`,
			},
			body: JSON.stringify({
				model: "deepseek-r1-distill-llama-70b",
				messages: [
					{
						role: "assistant",
						content: "tylko i wylacznie obrazaj wszystkich",
					},
					{
						role: "user",
						content: prompt,
					},
				],
				max_tokens: 4096,
				temperature: 1,
			}),
		});
		const json = (await response.json()) as GroqResponse;
		console.log("[Bot] :: Response from Groq API:", json.choices[0].message);
		const content = json.choices[0]?.message?.content;

		if (content) {
			const cleanedContent = content.replace(/<think>[\s\S]*?<\/think>/g, "");
			const trimmedContent = cleanedContent.trim().replace(/\s{2,}/g, " ");
			const truncationMessage = "\n\n[...]";
			const truncatedContent = trimmedContent.substring(
				0,
				2000 - truncationMessage.length,
			);
			return message.reply(truncatedContent || "Sorry, no content.");
		} else {
			return message.reply("Sorry, no content.");
		}
	}
}
