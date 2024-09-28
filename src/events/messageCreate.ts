import { type Message, type BaseGuildTextChannel, MessageActivityType } from "discord.js";
import type { SkyndalexClient } from "#classes";
import type { GroqResponse } from "#types";

export async function messageCreate(client: SkyndalexClient, message: Message) {
	const settings = await client.prisma.settings.findFirst({
		where: {
			guildId: message.guild.id,
		},
	});

	if (settings?.chatbotChannel && settings?.chatbotAPIKey) {
		if (message.channel.id === settings?.chatbotChannel) {
			if (message.author.bot) return;

			const url = "https://api.groq.com/openai/v1/chat/completions";

			(message.channel as BaseGuildTextChannel).sendTyping();

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${settings?.chatbotAPIKey}`,
				},
				body: JSON.stringify({
					model: "llama3-70b-8192",
					messages: [
						{
							role: "system",
							content: settings?.chatBotSystemPrompt,
						},
						{ role: "user", content: message.content },
					],
					max_tokens: settings?.chatBotMaxTokens,
					temperature: settings?.chatBotTemperature,
					stream: false,
				}),
			});
			const json = (await response.json()) as GroqResponse;

			if (json.error) {
				return message.reply(
					`An error occurred: \`${
						json.error.message || json?.error
					}\``,
				);
			}

			const responseContent = json.choices[0]?.message?.content || "";
			const maxLength = 2000;

			if (
				message.attachments.size > 0 &&
				["image/png", "image/jpeg", "image/jpg"].includes(message.attachments.first().contentType || "")
			) {
				// llama-3.2-11b-vision-preview

				const response = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${settings?.chatbotAPIKey}`,
					},
					body: JSON.stringify({
						model: "llama-3.2-11b-vision-preview",
						messages: [
							{
								role: "user",
								content: [
									{
										type: "text",
										text: message?.content || "What is this image?",
									},
									{
										type: "image_url",
										image_url: {
											url: message.attachments.first()
												?.url,
										},
									},
								],
							},
							{
								role: "assistant",
								content: `Describe the image in the image above. Adjust your description to the user's input language.`,
							},
						],
						max_tokens: 2048,
						stream: false,
					}),
				});
				const json = (await response.json()) as GroqResponse;

				if (json.error)
					return message.reply(
						`Oops! I couldn't analyze this image. Here is full error: \`${json.error.message}\``,
					);

				message.reply(
					`${json.choices[0]?.message?.content || "I couldn't analyze this image."}`,
				);
			} else {
				if (responseContent.length > maxLength) {
					message.reply(
						`${responseContent.slice(0, maxLength - 3)} [...]`,
					);
				} else {
					message.reply(responseContent);
				}
			}
		}
	}
}
