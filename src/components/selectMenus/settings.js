import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import find from "find-process";
export async function run(client, interaction) {
	const changeButton = new ButtonBuilder()
		.setCustomId(`change-${interaction.values[0]}`)
		.setLabel("Change")
		.setStyle(ButtonStyle.Primary);
	const disableButton = new ButtonBuilder()
		.setCustomId(`disable-${interaction.values[0].split("-")[1]}`)
		.setLabel("Disable")
		.setStyle(ButtonStyle.Danger);

	const row = new ActionRowBuilder().addComponents(
		changeButton,
		disableButton,
	);

	const embed = new EmbedBuilder()
		.setTimestamp()
		.setTitle(`Server settings - changing`)
		.setDescription(
			`You are changing the setting: \`${interaction.values[0]}\``,
		)
		.setColor("Yellow");

	return interaction.update({ embeds: [embed], components: [row] });
}
