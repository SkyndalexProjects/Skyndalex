import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import fetch from "node-fetch";
import findClientID from "../../functions/findClientID.js";
const clientID = await findClientID();

export default {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search tracks")
    // .addSubcommand((subcommand) =>
    //   subcommand
    //     .setName("spotify")
    //     .setDescription("Search for a track on Spotify")
    //     .addStringOption((option) =>
    //       option
    //         .setName("track")
    //         .setDescription("The track you want to search for")
    //         .setAutocomplete(true)
    //         .setRequired(true),
    //     ),
    // )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("soundcloud")
        .setDescription("Search for a track on SoundCloud")
        .addStringOption((option) =>
          option
            .setName("track")
            .setDescription("The track you want to search for")
            .setAutocomplete(true)
            .setRequired(true),
        ),
    ),

  async autocomplete(client, interaction) {
    console.log("interaction", interaction);
    switch (interaction.options.getSubcommand()) {
      case "spotify":
        const spotiValue = await interaction.options.getFocused();

        if (spotiValue) {
          const getUserData = await client.prisma.spotify.findUnique({
            where: {
              uid: interaction.user.id,
            },
          });

          const notAuthorized = [];

          for (let i = 0; i < 20; i++) {
            notAuthorized.push({
              name: "NOT AUTHORIZED! Please authorize your spotify account with Skyndalex first. /authorize",
              value: "not_authorized_" + i,
            });
          }

          if (!getUserData) return interaction.respond(notAuthorized);

          const spotiSearchURL = `https://api.spotify.com/v1/search?q=${spotiValue}&type=track`;
          const spotiResponse = await fetch(spotiSearchURL, {
            headers: {
              Authorization: `Bearer ${getUserData.accessToken}`,
            },
          });
          const spotiJSON = await spotiResponse.json();

          let spotidata = [];

          for (let i in spotiJSON.tracks.items) {
            spotidata.push({
              name: spotiJSON.tracks.items[i].name,
              value: spotiJSON.tracks.items[i].id,
            });
          }

          console.log("spotidata", spotidata);

          await interaction.respond(spotidata);
        }
        break;
      case "soundcloud":
        const soundCloudValue = await interaction.options.getFocused();
        const url = `https://api-v2.soundcloud.com/search/tracks?q=${soundCloudValue}&variant_ids=&facet=genre&user_id=303439-863403-472017-158497&client_id=${clientID}&limit=20&offset=0&linked_partitioning=1&app_version=1705403008&app_locale=pl`;

        const response = await fetch(url);
        const json = await response.json();

        let data = [];

        for (let i in json.collection) {
          data.push({
            name: json.collection[i].title,
            value: String(json.collection[i].id),
          });
        }

        console.log("Data", data);

        await interaction.respond(data);
        break;
    }
  },

  async execute(client, interaction) {
    const track = interaction.options.getString("track");

    const play = new ButtonBuilder()
      .setCustomId("play")
      .setLabel("Play")
      .setStyle(ButtonStyle.Success)
      .setEmoji("▶️");
    const row = new ActionRowBuilder().addComponents(play);

    switch (interaction.options.getSubcommand()) {
      case "soundcloud":
        const fetchTrack = await fetch(
          `https://api-v2.soundcloud.com/tracks?ids=${track}&client_id=${clientID}&%5Bobject%20Object%5D=&app_version=1705403008&app_locale=pl`,
        );
        const json = await fetchTrack.json();
        if (!json) return await interaction.reply("No results found!");

        const embed = new EmbedBuilder()
          .setURL(json[0].permalink_url)
          .setFooter({ text: `${json[0].permalink_url}` })
          .setTitle(
            `${json[0].kind}: *${json[0].title}* by *${
              json[0].user.username
            } (${json[0].user.full_name || "No fullname provided."})*`,
          )
          .setThumbnail(json[0].user.avatar_url)
          .addFields([
            {
              name: "📅 | Release date",
              value: `${json[0].release_date || "*None*"}`,
              inline: true,
            },
            {
              name: "🏳️‍🌈 | Genre",
              value: `${json[0].genre || "*None*"}`,
              inline: true,
            },
            {
              name: "👍 | Likes",
              value: `${json[0].likes_count || "*None*"}`,
              inline: true,
            },
            {
              name: "🔁 | Reposts",
              value: `${json[0].reposts_count || "*None*"}`,
              inline: true,
            },
            {
              name: "💭 | Comments",
              value: `${json[0].comment_count || "*None*"}`,
              inline: true,
            },
            {
              name: "🎧 | Plays",
              value: `${json[0].playback_count || "*None*"}`,
              inline: true,
            },
          ])
          .setColor("Green");

        await interaction.reply({ embeds: [embed], components: [row] });
        break;
      case "spotify":
        const getUserData = await client.prisma.spotify.findUnique({
          where: {
            uid: interaction.user.id,
          },
        });

        console.log("track", track);
        console.log("track id", track);

        const spotiGetTrackURL = `https://api.spotify.com/v1/tracks/${track}`;
        const spotiGetTrackResponse = await fetch(spotiGetTrackURL, {
          headers: {
            Authorization: `Bearer ${getUserData.accessToken}`,
          },
        });
        const spotiGetTrackJSON = await spotiGetTrackResponse.json();

        console.log("Final JSON", spotiGetTrackJSON);

        const spotiEmbed = new EmbedBuilder()
          .setTitle(
            `Spotify: *${spotiGetTrackJSON.name}* by *${spotiGetTrackJSON.artists[0].name}*`,
          )
          .setURL(spotiGetTrackJSON.external_urls.spotify)
          .setThumbnail(spotiGetTrackJSON.album.images[0].url)
          .addFields([
            {
              name: "📅 | Release date",
              value: `${spotiGetTrackJSON.album.release_date || "*None*"}`,
              inline: true,
            },
            {
              name: "🎧 | Popularity",
              value: `${spotiGetTrackJSON.popularity || "*None*"}`,
              inline: true,
            },
            {
              name: "🎵 | Album",
              value: `${spotiGetTrackJSON.album.name || "*None*"}`,
              inline: true,
            },
            {
              name: "🎶 | Duration",
              value: `${spotiGetTrackJSON.duration_ms || "*None*"}`,
              inline: true,
            },
          ])
          .setColor("Green");
        await interaction.reply({ embeds: [spotiEmbed], components: [row] });
        break;
    }
  },
};
