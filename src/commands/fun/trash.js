import {
	AttachmentBuilder,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
export async function run(client, interaction) {
	try {
		const thing = encodeURIComponent(
			interaction.options.getString("trash"),
		);
		const text = `https://trash-api.deno.dev/?thing=${thing}`;

		return interaction.reply({ content: text });
	} catch (e) {
		console.log("Error:", e);
		await interaction.reply(
			"An error occurred while processing the command.",
		);
	}
}

export const data = {
	...new SlashCommandBuilder()
		.setName("trash")
		.setDescription("trash.")
		.addStringOption((option) =>
			option
				.setName("trash")
				.setDescription("thing to throw in the trash.")
				.setMaxLength(100)
				.setRequired(true),
		),
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};
