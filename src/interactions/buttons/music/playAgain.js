import { EmbedBuilder } from "discord.js";
import fetch from "node-fetch";

export default {
  customId: "play_again",
  type: "button",

  run: async (client, interaction) => {
    await interaction.deferReply();

    const tiktok_url =
      interaction.message.embeds[0].data.description.split("from ")[1];
    const url = new URL(tiktok_url);

    const memberChannel = interaction.member.voice.channel;

    if (!memberChannel) {
      return await interaction.reply(
        `Hey, ${interaction.user.tag}! You must be in a voice channel to use "Play again" button.`,
      );
    }

    const res = await fetch(`https://co.wuk.sh/api/json`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: encodeURI(tiktok_url),
      }),
    });

    const json = await res.json();

    const embedError = new EmbedBuilder()
      .setTitle("❌ Error")
      .setDescription(
        `Error while fetching ${url.hostname} sound from ${tiktok_url}.\n\n**Error title:**\n\`${json.text}\``,
      )
      .setColor("Red");

    if (json.status === "error") {
      return interaction.editReply({ embeds: [embedError] });
    }

    const resourceUrl = json.url || json.audio;

    const node = client.shoukaku.getNode();
    if (!node) return;

    const result = await node.rest.resolve(resourceUrl);
    if (!result?.tracks.length) return;

    const metadata = result.tracks.shift();

    const playingEmbed = new EmbedBuilder()
      .setTitle(`✅ Playing again ${url.hostname} sound`)
      .setDescription(`Playing ${url.hostname} sound from ${tiktok_url}`)
      .setFooter({
        text: `Requested by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setColor("Yellow");

    const finishedPlayingAgainEembed = new EmbedBuilder()
      .setTitle(`✅ Finished playing again ${url.hostname} sound`)
      .setDescription(
        `Finished playing ${url.hostname} sound from ${tiktok_url}`,
      )
      .setColor("Yellow");

    let player = node.players.get(memberChannel.guild.id);

    if (!player) {
      player = await node.joinChannel({
        guildId: memberChannel.guild.id,
        channelId: memberChannel.id,
        shardId: 0,
      });

      await player.playTrack({ track: metadata.track }).setVolume(0.5);
      await interaction.editReply({ embeds: [playingEmbed], files: [] });
    } else {
      await player.stopTrack();
      await player.playTrack({ track: metadata.track }).setVolume(0.5);

      await interaction.editReply({
        content: `<\switched\>`,
        embeds: [playingEmbed],
        files: [],
      });
    }

    player.on("end", async () => {
      await player.stopTrack();

      await interaction.editReply({
        embeds: [finishedPlayingAgainEembed],
        content: `<@${interaction.user.id}>`,
        files: [],
      });

      await node.leaveChannel(interaction.guild.id);
    });
  },
};
