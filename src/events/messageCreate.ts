import process from "node:process";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	type Message,
	MessageFlags,
	TextDisplayBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import type { HuggingfaceRouterData } from "#types";

const HUGGINGFACE_CHAT_COMPLETIONS_URL =
	"https://router.huggingface.co/novita/v3/openai/chat/completions";
const TRUNCATION_MESSAGE = "\n\n[...]";
const DISCORD_MESSAGE_MAX_LENGTH = 2000;

function buildAuthorizeComponents() {
	const authorizeButton = new ButtonBuilder()
		.setLabel("Authorize")
		.setStyle(ButtonStyle.Link)
		.setURL(process.env.OAUTH_TO_HUGGINGFACE ?? "https://default-auth-url.com");

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

	return { container, row };
}

function truncateForDiscord(content: string) {
	const normalizedContent = content.trim().replace(/\s{2,}/g, " ");
	const maxLength = DISCORD_MESSAGE_MAX_LENGTH - TRUNCATION_MESSAGE.length;

	if (normalizedContent.length <= maxLength) {
		return normalizedContent;
	}

	return `${normalizedContent.substring(0, maxLength)}${TRUNCATION_MESSAGE}`;
}

async function replyWithAuthorizePrompt(
	message: Message,
	container: ContainerBuilder,
	row: ActionRowBuilder<ButtonBuilder>,
) {
	if (message.reference !== null) {
		return;
	}

	await message.reply({
		flags: MessageFlags.IsComponentsV2,
		components: [container, row],
	});
}

export async function messageCreate(client: SkyndalexClient, message: Message) {
	if (!client.user || !message.mentions.has(client.user.id)) {
		return;
	}

	const discordAccount = await client.prisma.account.findFirst({
		where: {
			accountId: message.author.id,
			providerId: "discord",
		},
	});

	if (!discordAccount) {
		return;
	}

	const huggingfaceAccount = await client.prisma.account.findFirst({
		where: {
			userId: discordAccount.userId,
			providerId: "huggingface",
		},
	});

	if (message.reference === null && "sendTyping" in message.channel) {
		await message.channel.sendTyping();
	}

	const { container, row } = buildAuthorizeComponents();

	if (!huggingfaceAccount?.accessToken) {
		await replyWithAuthorizePrompt(message, container, row);
		return;
	}

	let data: HuggingfaceRouterData;
	try {
		const result = await fetch(HUGGINGFACE_CHAT_COMPLETIONS_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${huggingfaceAccount.accessToken}`,
			},
			body: JSON.stringify({
				model: "deepseek/deepseek-v3-0324",
				messages: [
					{
						role: "system",
						content:
							"Jesteś pomocnym asystentem Skyndalex, który odpowiada na pytania użytkowników w sposób zwięzły i przyjazny.",
					},
					{ role: "user", content: message.content },
				],
				max_tokens: 2048,
				temperature: 1,
				provider: "auto",
			}),
		});

		data = (await result.json()) as HuggingfaceRouterData;
	} catch {
		await message.reply(
			"Sorry, an error occurred while processing your request.",
		);
		return;
	}

	if (data?.error) {
		await replyWithAuthorizePrompt(message, container, row);
		return;
	}

	const content = data.choices?.[0]?.message?.content;
	if (typeof content !== "string") {
		if (message.reference === null) {
			await message.reply(
				"Sorry, an error occurred while processing your request.",
			);
		}
		return;
	}

	const finalContent = truncateForDiscord(content);
	await message.reply(finalContent || "Sorry, no response");
}
