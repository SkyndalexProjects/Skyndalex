import {
  AttachmentBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import fetch from "node-fetch";

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play TikTok sound.")
    .addStringOption((option) =>
      option.setName("url").setDescription("TikTok URL").setRequired(true),
    ),

  async execute(client, interaction) {
    await interaction.deferReply();
    const tiktok_url = interaction.options.getString("url");

    const validDomains = [
      "tiktok.com",
      "soundcloud.com",
      "on.soundcloud.com",
      "m.soundcloud.com",
      "www.tiktok.com",
    ];
    const url = new URL(tiktok_url);
    if (!validDomains.includes(url.hostname)) {
      return await interaction.followUp(
        `Wrong domain. Only TikTok and SoundCloud are accepted by the bot!\n\n**You provided:**\n\`${url.hostname}\`\n**Full string:**\n\`${tiktok_url}\``,
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
        `Error while fetching TikTok sound from ${tiktok_url}.\n\n**Error title:**\n\`${json.text}\``,
      )
      .setColor("Red");

    if (json.status === "error") {
      return interaction.followUp({ embeds: [embedError] });
    }

    const memberChannel = interaction.member.voice.channel;
    if (!memberChannel) {
      return await interaction.followUp(
        `Hey, ${interaction.user.tag}! You must be in a voice channel to use this command.`,
      );
    }

    const resourceUrl = json.url;

    const node = client.shoukaku.getNode();
    if (!node) return;

    const result = await node.rest.resolve(resourceUrl);
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
        .setTitle("✅ Playing TikTok sound")
        .setDescription(`Playing TikTok sound from ${tiktok_url}`)
        .setColor("Green");

      await interaction.followUp({ embeds: [embed] });

      player.on("end", async () => {
        const embed = new EmbedBuilder()
          .setTitle("✅ Finished playing TikTok sound")
          .setDescription(`Finished playing TikTok sound from ${tiktok_url}`)
          .setColor("Yellow");
        await interaction.followUp({
          content: `<@${interaction.user.id}>\n[🔗 | Immediately download?](${resourceUrl})`,
          embeds: [embed],
          files: [
            new AttachmentBuilder()
              .setFile(resourceUrl)
              .setName("skyndalex.xyz.mp3"),
          ],
        });

        await node.leaveChannel(interaction.guild.id);
      });
    } else {
      const node = client.shoukaku.getNode();
      if (!node) return;

      const currentPlayer = await node.players.get(interaction.guild.id);
      await currentPlayer.stopTrack();
      await currentPlayer.playTrack({ track: metadata.track }).setVolume(0.5);

      const embed = new EmbedBuilder()
        .setTitle("🔀 Switched to song")
        .setDescription(`Switched song to: ${tiktok_url}`)
        .setColor("Green");
      await interaction.followUp({ embeds: [embed] });

      currentPlayer.on("end", async () => {
        const embed = new EmbedBuilder()
          .setTitle("✅ Finished playing TikTok sound")
          .setDescription(
            `Finished playing TikTok sound from ${tiktok_url}. (Switched)`,
          )
          .setColor("Blurple");
        await interaction.followUp({
          content: `<@${interaction.user.id}>`,
          embeds: [embed],
        });

        await node.leaveChannel(interaction.guild.id);
      });
    }
  },
};
