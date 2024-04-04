import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
export async function run(client, interaction) {
  const thing = interaction.options.getString("trash");
  const text = `https://trash-api.deno.dev/text?thing=${thing}`
  const fetchText = await fetch(text);
  const textData = await fetchText.text();

  if (!textData) return await interaction.reply("Failed to fetch text.");

  const embed = new EmbedBuilder()
    .setColor("Random")
    .setDescription(`\`\`${textData}\`\``)
    .setFooter({ text: "https://github.com/CyberL1/trash-api" })
  await interaction.reply({ embeds: [embed] });
}

export const data = {
  ...new SlashCommandBuilder()
    .setName("trash")
    .setDescription("trash.")
    .addStringOption((option) =>
      option
        .setName("trash")
        .setDescription("thing to throw in the trash.")
        .setRequired(true),
    ),
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}