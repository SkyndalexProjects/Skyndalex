import { EmbedBuilder } from "discord.js";

export async function run(client, interaction) {
	const memberChannel = interaction.member.voice.channel;

	if (!memberChannel) {
		return await interaction.reply(
			`Hey, ${interaction.user.tag}! You must be in a voice channel to use "Play again" button.`,
		);
	}

	const radioResourceUrl = interaction.customId.split("-")[1];
	console.log(radioResourceUrl);

	const node = client.shoukaku.getNode();
	if (!node) return;

	const result = await node.rest.resolve(radioResourceUrl);
	if (!result?.tracks.length) return;

	const metadata = result.tracks.shift();
	const existingPlayer = node.players.get(interaction.guild.id);

	if (!existingPlayer) {
		const player = await node.joinChannel({
			guildId: interaction.guild.id,
			channelId: memberChannel.id,
			shardId: 0,
		});

		await player.playTrack({ track: metadata.track }).setVolume(0.5);

		const embed = new EmbedBuilder()
			.setTitle(`✅ Resumed radio`)
			.setFooter({
				text: `Executed by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
			})
			.setColor("Green");

		await interaction.reply({ embeds: [embed] });
	} else {
		// await interaction.reply(`❌ | I'm already playing.`);

		const node = client.shoukaku.getNode();
		if (!node) return;

		const currentPlayer = await node.players.get(interaction.guild.id);
		await currentPlayer.stopTrack();
		await currentPlayer.playTrack({ track: metadata.track }).setVolume(0.5);

		// node.leaveChannel(interaction.guild.id);

		const switchedEmbed = new EmbedBuilder()
			.setTitle(`Resumed radio`)
			.setDescription(`${radioResourceUrl}`)
			.setFooter({
				text: `Executed by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
			})
			.setColor("Blurple");
		await interaction.reply({ embeds: [switchedEmbed] });
	}
}
