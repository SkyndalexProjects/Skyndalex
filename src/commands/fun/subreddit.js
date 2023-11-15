import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";

export default {
  data: new SlashCommandBuilder()
    .setName("subreddit")
    .setDescription("Generate random image from a specific subreddit.")
    .addStringOption((option) =>
      option
        .setName("subreddit")
        .setDescription("Subreddit name")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("limit")
        .setDescription("Limit of posts")
        .setRequired(false),
    )
    .setNSFW(true),

  async execute(client, interaction) {
    const subreddit = interaction.options.getString("subreddit");
    const limit = interaction.options.getInteger("limit") || 500;

    await interaction.deferReply();
    fetch(`https://www.reddit.com/r/${subreddit}.json?limit=${limit}`)
      .then((res) => res.json())
      .then(async (json) => {
        let post =
          json.data.children[
            Math.floor(Math.random() * json.data.children.length)
          ].data;

        const embed = new EmbedBuilder()
          .setTitle(`\`r/${post.subreddit}:\` ${post.title}`)
          .setFooter({ text: `👍 ${post.ups} | 💬 ${post.num_comments}` })
          .setURL(post.url)
          .setColor("#3498db");

        if (
          post.url.endsWith(".jpg") ||
          post.url.endsWith(".png") ||
          post.url.endsWith(".gif") ||
          post.url.endsWith(".jpeg")
        )
          embed.setImage(post.url);
        await interaction.reply({ embeds: [embed] });
      });
  },
};
