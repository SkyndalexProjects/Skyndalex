import type { Message, BaseGuildTextChannel } from "discord.js";
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
