import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";

export default {
  data: new SlashCommandBuilder()
    .setName("radio")
    .setDescription("Play radio on voice channel")
    .addStringOption((option) =>
      option
        .setName("radio")
        .setDescription("Radio station")
        .setRequired(true)
        .setAutocomplete(true),
    ),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const url = `https://radio.garden/api/search?q=${focusedValue}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "accept: application/json",
      },
    });
    const json = await response.json();

    console.log(json.hits.hits[0]);

    let data = [];
    for (let i in json.hits.hits) {
      if (json.hits.hits[i]._source.type === "channel") {
        data.push(
          `${json.hits.hits[i]._source.title}-${
            json.hits.hits[i]._source.url.split("/")[3]
          }`,
        );
      }
      console.log(data.map((choice) => ({ name: choice, value: choice })));
    }

    await interaction.respond(
      data.map((choice) => ({ name: choice, value: choice })),
    );
  },
  async execute(client, interaction) {
    const id = interaction.options.getString("radio").split("-")[1];
    const memberChannel = interaction.member.voice.channel;

    if (!memberChannel) {
      return await interaction.reply(
        `Hey, ${interaction.user.tag}! You must be in a voice channel to use this command.`,
      );
    }

    const url = `https://radio.garden/api/ara/content/channel/${id}`;
    const resourceUrl = `https://radio.garden/api/ara/content/listen/${id}/channel.mp3`;

    const fetchStation = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    const json = await fetchStation.json();
    if (json.error === "Not found")
      return interaction.reply("❌ | Station not found!");

    const node = client.shoukaku.getNode();
    if (!node) return;

    const result = await node.rest.resolve(resourceUrl);
    if (!result?.tracks.length) return;
    const metadata = result.tracks.shift();

    const existingPlayer = node.players.has(interaction.guild.id);

    if (!existingPlayer) {
      const player = await node.joinChannel({
        guildId: interaction.guild.id,
        channelId: memberChannel.id,
        shardId: 0,
      });

      await player.playTrack({ track: metadata.track }).setVolume(0.5);

      const embed = new EmbedBuilder()
        .setTitle(`✅ Playing radio "${json.data.title} 🎶"`)
        .setDescription(
          `🌐 | **Country:** ${json.data.country.title} || 🗺️ | **Place:** ${json.data.place.title}`,
        )
        .setFooter({ text: `🖥️ | Radio website: ${json.data.website}` })
        .setTimestamp()
        .setColor("Green");

      await interaction.reply({ embeds: [embed] });
    } else {
      const currentPlayer = await node.players.get(interaction.guild.id);
      await currentPlayer.stopTrack();
      await currentPlayer.playTrack({ track: metadata.track }).setVolume(0.5);

      const switchedEmbed = new EmbedBuilder()
        .setTitle(`🔀 | Switched radio to "${json.data.title} 🎶"`)
        .setDescription(
          `🌐 | **Country:** ${json.data.country.title} || 🗺️ | **Place:** ${json.data.place.title}`,
        )
        .setFooter({ text: `🖥️ | Radio website: ${json.data.website}` })
        .setColor("Blurple")
        .setTimestamp();
      await interaction.reply({ embeds: [switchedEmbed] });
    }
  },
};
