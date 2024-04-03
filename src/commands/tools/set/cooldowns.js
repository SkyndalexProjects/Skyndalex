import {
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
} from "discord.js";

export async function run(client, interaction) {
	const seconds = interaction.options.getInteger("seconds");
	const command = interaction.options.getString("command");
	const avCommands = client.commands.map((cmd) => cmd.data.name);
	if (!avCommands.includes(command)) {
		const embedError = new EmbedBuilder()
			.setDescription(`Command \`${command}\` not found`)
			.setColor("DarkRed");
		return await interaction.reply({ embeds: [embedError] });
	}

	await client.prisma.guildCooldownsSettings.upsert({
		where: {
			guildId_command: {
				guildId: interaction.guild.id,
				command: command,
			},
		},
		update: {
			cooldown: String(seconds),
		},
		create: {
			guildId: interaction.guild.id,
			command: command,
			cooldown: String(seconds),
		},
	});

	const embedSet = new EmbedBuilder()
		.setDescription(
			`Cooldown for \`${command}\` set to \`${seconds}\` seconds`,
		)
		.setColor("Blurple");
	await interaction.reply({ embeds: [embedSet] });
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("cooldowns")
	.setDescription("Set cooldowns")
	.addIntegerOption((option) =>
		option
			.setName("seconds")
			.setDescription("Cooldown in seconds")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option.setName("command").setDescription("Command").setRequired(true),
	);
