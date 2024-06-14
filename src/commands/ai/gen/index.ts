import { SlashCommandBuilder } from "discord.js";

export const data = {
	...new SlashCommandBuilder()
		.setName("gen")
		.setDescription("Generate content with AI")

		// NOTE: Subcommands options are declared here for correct userapps implementation.

		.addSubcommand((subcommand) =>
			subcommand
				.setName("text")
				.setDescription("Generate text")
				.addStringOption((option) =>
					option
						.setName("prompt")
						.setDescription("Prompt for the AI")
						.setRequired(true),
				)
				.addStringOption((option) =>
					option.setName("model").setDescription("Model to use"),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("img")
				.setDescription("Generate image with AI")
				.addStringOption((option) =>
					option
						.setName("prompt")
						.setDescription("Prompt for the AI")
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName("model")
						.setDescription("Model to use")
						.setAutocomplete(true),
				),
		),
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};
