import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import fetch from "node-fetch";
import findClientID from "../../utils/findClientID.js";
const clientID = await findClientID();

export default {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search tracks")
    .addStringOption((option) =>
      option
        .setName("track")
        .setDescription("Search tracks")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    if (focusedValue) {
      const url = `https://api-v2.soundcloud.com/search/tracks?q=${focusedValue}&variant_ids=&facet=genre&user_id=303439-863403-472017-158497&client_id=${clientID}&limit=20&offset=0&linked_partitioning=1&app_version=1705403008&app_locale=pl`;

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
    }
  },

  async execute(client, interaction) {
    const track = interaction.options.getString("track");
    const fetchTrack = await fetch(
      `https://api-v2.soundcloud.com/tracks?ids=${track}&client_id=${clientID}&%5Bobject%20Object%5D=&app_version=1705403008&app_locale=pl`,
    );
    const json = await fetchTrack.json();
    if (!json) return await interaction.reply("No results found!");

    const play = new ButtonBuilder()
      .setCustomId("play")
      .setLabel("Play")
      .setStyle(ButtonStyle.Success)
      .setEmoji("▶️");
    const row = new ActionRowBuilder().addComponents(play);

    const embed = new EmbedBuilder()
      .setURL(json[0].permalink_url)
      .setFooter({ text: `${json[0].permalink_url}` })
      .setTitle(
        `${json[0].kind}: *${json[0].title}* by *${json[0].user.username} (${
          json[0].user.full_name || "No fullname provided."
        })*`,
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
  },
};
