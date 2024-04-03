import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
export async function run(client, interaction) {
	const channel = await client.channels.fetch("1183142476270276819");
	const data = (await channel.messages.fetch({ limit: 100 }))
		.filter((x) => x?.content?.length >= 1)
		.map((x) => x);

	if (!data) return interaction.reply("No data. The bot is not on support server");
	const embed = new EmbedBuilder()
		.setTitle(`Page 1 of ${data.length + 1}`)
		.setDescription(`${data[0].content}`);

	const row = new ActionRowBuilder().setComponents([
		new ButtonBuilder()
			.setCustomId("updates-page_0")
			.setLabel("Previous")
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(true),
		new ButtonBuilder()
			.setCustomId("updates-page_1")
			.setLabel("Next")
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(data.length === 1),
	]);

	interaction.reply({ embeds: [embed], components: [row] });
}

export const data = new SlashCommandBuilder()
	.setName("updates")
	.setDescription("List all announcements");
