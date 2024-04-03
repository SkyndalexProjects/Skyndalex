import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { updateWallet } from "../../functions/updateWallet.js";
import { addCooldown } from "../../functions/addCooldown.js";

export async function run(client, interaction) {
	const money = Math.floor(Math.random() * (1000 + 1));
	const actions = ["Win", "Lose"];
	const action = actions[Math.floor(Math.random() * actions.length)];

	if (action === "Win") {
		await updateWallet(
			client,
			interaction.guild.id,
			interaction.user.id,
			+money,
		);
		const embedSuccess = new EmbedBuilder()
			.setDescription(`+${money}`)
			.setColor("DarkGreen");
		await interaction.reply({ embeds: [embedSuccess] });
	} else {
		await updateWallet(
			client,
			interaction.guild.id,
			interaction.user.id,
			+money,
		);
		const embedFail = new EmbedBuilder()
			.setDescription(`+${money}`)
			.setColor("DarkRed");
		await interaction.reply({ embeds: [embedFail] });
	}
}
export const data = new SlashCommandBuilder()
	.setName("crime")
	.setDescription("Crime");
