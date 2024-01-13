import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
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
    )
    .addStringOption((option) =>
      option
        .setName("custom_title")
        .setDescription("Custom title for the song")
        .setRequired(false),
    ),
  async execute(client, interaction) {
    await interaction.deferReply();
    const tiktok_url = interaction.options.getString("url");
    const custom_title = interaction.options.getString("custom_title");

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
        disableMetadata: false,
      }),
    });

    const json = await res.json();
    console.log("json", json);
    const embedError = new EmbedBuilder()
      .setTitle("❌ Error")
      .setDescription(
        `Error while fetching ${url.hostname} sound from ${tiktok_url}.\n\n**Error title:**\n\`${json.text}\``,
      )
      .setColor("Red");

    if (json.status === "error") {
      return interaction.editReply({ embeds: [embedError] });
    }

    const memberChannel = interaction.member.voice.channel;
    if (!memberChannel) {
      return await interaction.editReply(
        `Hey, ${interaction.user.tag}! You must be in a voice channel to use this command.`,
      );
    }

    const resourceUrl = json.url || json.audio;

    const node = client.shoukaku.getNode();
    if (!node) return;

    const result = await node.rest.resolve(resourceUrl);
    if (!result?.tracks.length) return;

    const metadata = result.tracks.shift();

    const playingEmbed = new EmbedBuilder()
      .setTitle(`✅ Playing *${custom_title || url.hostname}* sound`)
      .setDescription(`Playing ${url.hostname} sound from ${tiktok_url}`)
      .setColor("Green");

    const songSwitchedEmbed = new EmbedBuilder()
      .setTitle(`🔀 Switched to *${custom_title || url.hostname}* sound`)
      .setDescription(`Switched to ${url.hostname} sound from ${tiktok_url}`)
      .setColor("Green");

    const finishedPlayingSongEmbed = new EmbedBuilder()
      .setTitle(`✅ Finished playing *${custom_title || url.hostname}* sound`)
      .setDescription(
        `Finished playing ${url.hostname} sound from ${tiktok_url}`,
      )
      .setColor("Green");

    const playAgainButton = new ButtonBuilder()
      .setCustomId(`play_again`)
      .setLabel("Play again")
      .setStyle(ButtonStyle.Success);

    let player = node.players.get(interaction.guild.id);

    if (!player) {
      console.log("I'm here! (Started player)");

      player = await node.joinChannel({
        guildId: interaction.guild.id,
        channelId: memberChannel.id,
        shardId: 0,
      });

      await player.stopTrack();
      await player.playTrack({ track: metadata.track }).setVolume(0.5);

      await interaction.editReply({
        embeds: [playingEmbed],
        files: [
          new AttachmentBuilder()
            .setFile(resourceUrl)
            .setName("skyndalex.xyz.mp3"),
        ],
        components: [new ActionRowBuilder().addComponents(playAgainButton)],
      });
    } else {
      console.log("I'm here! (Switched player)");

      await player.stopTrack();
      await player.playTrack({ track: metadata.track }).setVolume(0.5);

      await interaction.followUp({
        embeds: [songSwitchedEmbed],
        content: `<@${interaction.user.id}>`,
        files: [
          new AttachmentBuilder()
            .setFile(resourceUrl)
            .setName("skyndalex.xyz.mp3"),
        ],
        components: [new ActionRowBuilder().addComponents(playAgainButton)],
      });
    }

    player.on("end", async () => {
      console.log("I'm here! (Player ended)");

      await player.stopTrack();

      await interaction.editReply({
        embeds: [finishedPlayingSongEmbed],
        content: `<@${interaction.user.id}>`,
        files: [
          new AttachmentBuilder()
            .setFile(resourceUrl)
            .setName("skyndalex.xyz.mp3"),
        ],
        components: [new ActionRowBuilder().addComponents(playAgainButton)],
      });

      await node.leaveChannel(interaction.guild.id);
    });
  },
};
