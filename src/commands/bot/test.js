import { SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";

export default {
  data: new SlashCommandBuilder().setName("test").setDescription("test"),

  async execute(client, interaction) {
    const value = "donald tusk";
    const url = `https://www.tiktok.com/api/search/general/preview/?keyword=${value}`;

    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
  },
};
