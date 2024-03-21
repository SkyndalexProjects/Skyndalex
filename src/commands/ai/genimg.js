import { HfInference } from "@huggingface/inference";
import {
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

const hf = new HfInference(process.env.HF_TOKEN);
const imageQueue = new Map();

export default {
  data: {
    ...new SlashCommandBuilder()
      .setName("genimg")
      .setDescription("Generate an image")
      .addStringOption((option) =>
        option
          .setName("input")
          .setDescription("Input for the AI")
          .setRequired(true),

      ),
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },

  async execute(client, interaction) {
    const input = interaction.options.get("input").value;
    const queuePosition = imageQueue.size + 1;
    const taskId = `${interaction.guild?.id}-${
      interaction.user.id
    }-${Date.now()}`;
    const model = "stabilityai/stable-diffusion-2-1";
    try {
      const deleteAttachment = new ButtonBuilder()
        .setCustomId("deleteAttachment")
        .setLabel("Delete")
        .setStyle(ButtonStyle.Danger);

      if (!imageQueue.has(taskId)) {
        imageQueue.set(taskId, {
          status: "queued",
          position: queuePosition,
          input: input,
        });

        const queueMessage = new EmbedBuilder()
          .setColor("#3498db")
          .setDescription(
            ` <a:4704loadingicon:1183416396223352852> | Processing image\n\n**Position in queue:** \`${queuePosition}\`\n**Prompt:** \`${input}\``,
          )
          .setTimestamp()
          .setFooter({ text: "Powered by Huggingface using Skyndalex bot" });

        const queueReply = await interaction.reply({ embeds: [queueMessage] });

        const response = await hf.textToImage({
          inputs: input,
          model: model,
          parameters: {
            negative_prompt: "blurry",
          },
          use_cache: false,
          wait_for_model: true,
        });

        const imageBuffer = await response.arrayBuffer();
        const image = new AttachmentBuilder(
          Buffer.from(imageBuffer),
          "image.png",
        );

        const newEmbed = new EmbedBuilder()
          .setDescription(
            `✅ Generated img "**${input}**" requested from input by **${interaction.user.username}**`,
          )
          .setColor("#12ff00")
          .setTimestamp()
          .setFooter({ text: "Powered by Huggingface using Skyndalex bot" });

        if (!interaction.channel.nsfw)
          newEmbed.setFooter({
            text: "WARNING! Watch out your prompts. The bot can generate NSFW image",
          });
        const download = new ButtonBuilder()
          .setURL("https://harnes-is-gay.com")
          .setLabel("Download")
          .setStyle(ButtonStyle.Link);

        const botMessage = await queueReply.edit({
          embeds: [newEmbed],
          files: [image],
          components: [
            {
              type: 1,
              components: [download, deleteAttachment],
            },
          ],
        });

        const secondMessage = new EmbedBuilder()
          .setColor("#12ff00")
          .setDescription("✅ Your image is ready!");
        if (!interaction.channel.nsfw)
          newEmbed.setFooter({
            text: "WARNING! Watch out your prompts. The AI model can generate NSFW image",
          });

        await interaction.followUp({
          content: `<@${interaction.user.id}>,`,
          embeds: [secondMessage],
        });

        imageQueue.delete(taskId);
      }
    } catch (e) {
      imageQueue.delete(taskId);

      console.error(e);
      const embedError = new EmbedBuilder()
        .setTitle("An error occurred while generating image")
        .setDescription(
          `Model timed out or image is not available.\n\n**Model:** \`${model}\`\n**Prompt:** \`${input}\``,
        )
        .setColor("Red");

      await interaction.editReply({ embeds: [embedError] });
    }
  },
};
