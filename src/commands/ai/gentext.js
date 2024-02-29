import { HfInference } from "@huggingface/inference";
import {
  ButtonStyle,
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder
} from "discord.js";

const hf = new HfInference(process.env.HF_TOKEN);

export default {
  data: new SlashCommandBuilder()
    .setName("gentext")
    .setDescription("Generate text")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("Input for the AI")
        .setRequired(true),
    ),

  async execute(client, interaction) {
    const prompt = interaction.options.getString("input");

    await interaction.deferReply();

    const result = await hf.textGeneration({
      model: "google/gemma-7b-it",
      inputs: prompt,
    });

    const continueButton = new ButtonBuilder()
      .setCustomId("continue")
      .setLabel("Continue")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(continueButton);

    await interaction.editReply({ content: result.generated_text, components: [row],  allowedMentions: { parse: [] } })
    console.log("result", result)
  },
};
