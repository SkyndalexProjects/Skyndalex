import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";
export default {
  data: {
    ...new SlashCommandBuilder().setName("cat").setDescription("Random cat"),
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },

  async execute(client, interaction) {
    const response = await fetch(
      "https://api.thecatapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&page=0&limit=1",
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.THECATAPI_KEY,
        },
      },
    );
    const json = await response.json();

    console.log("json", json[0].url);
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setImage(json[0].url)
      .setFooter({ text: "Powered by thecatapi.com" });

    await interaction.reply({ embeds: [embed] });
  },
};
