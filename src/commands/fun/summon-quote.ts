import {
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();

	const quoteId = interaction.options.getInteger("quote", true);
	const quote = await client.prisma.userQuotes.findUnique({
		where: {
			id: quoteId,
			userId: interaction.user.id,
		},
	});

	if (!quote) {
		await interaction.editReply("No quotes found.");
		return;
	}

	const user = await client.users.fetch(quote.userId);

	const attachment = await client.canvas.quote.createAttachment(
		{
			message: quote.quote,
			author: quote.author,
			user,
		},
		"quote.png",
	);

	await interaction.editReply({
		files: [attachment],
	});
}
export const data = new SlashCommandBuilder()
	.setName("summon-quote")
	.setDescription("Summon a saved quote")
	.addIntegerOption((option) =>
		option
			.setName("quote")
			.setDescription("Choose a quote")
			.setRequired(true)
			.setAutocomplete(true),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);

export async function autocomplete(interaction: AutocompleteInteraction) {
	const client = interaction.client as SkyndalexClient;
	const search = interaction.options.getFocused();

	const quotes = await client.prisma.userQuotes.findMany({
		where: {
			userId: interaction.user.id,
			OR: [
				{
					quote: {
						contains: search,
						mode: "insensitive",
					},
				},
				{
					author: {
						contains: search,
						mode: "insensitive",
					},
				},
			],
		},
		orderBy: {
			createdAt: "desc",
		},
		take: 25,
	});

	await interaction.respond(
		quotes.map((quote) => ({
			name: `${quote.author}: ${quote.quote}`.slice(0, 100),
			value: quote.id,
		})),
	);
}
