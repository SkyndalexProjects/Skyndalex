import { HfInference } from "@huggingface/inference";
import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const hf = new HfInference(process.env.HF_TOKEN);
export default {
  customId: "continue",
  type: "button",

  run: async (client, interaction) => {
    const previousContent = interaction.message.content;

    const newContent = await hf.textGeneration({
      model: "google/gemma-7b-it",
      inputs: previousContent,
    });

    if (previousContent === newContent.generated_text) {
      const disabledButton = new ButtonBuilder()
        .setCustomId("nothing_more_to_continue")
        .setLabel("Nothing more to generate")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);
      const updatedActionRow = new ActionRowBuilder().addComponents(disabledButton);


      return interaction.update({ components: [updatedActionRow] });
    }
    return interaction.update({ content: newContent.generated_text })

  },
};
