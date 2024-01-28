import {
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  ActionRowBuilder
} from "discord.js";
import { fetchData } from "../../events/messageCreate.js";

const imageQueue = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName("genimg")
    .setDescription("Generate an image")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("Input for the AI")
        .setRequired(true),
    ),

  async execute(client, interaction) {
    try {
      const input = interaction.options.get("input").value;
      const queuePosition = imageQueue.size + 1;
      const taskId = `${interaction.guild.id}-${
        interaction.user.id
      }-${Date.now()}`;

      const like = new ButtonBuilder()
        .setCustomId("like")
        .setLabel("👍")
        .setStyle(ButtonStyle.Primary);

      const dislike = new ButtonBuilder()
        .setCustomId("dislike")
        .setLabel("👎")
        .setStyle(ButtonStyle.Primary);

      const deleteAttachment = new ButtonBuilder()
        .setCustomId("deleteAttachment")
        .setLabel("Delete")
        .setStyle(ButtonStyle.Danger);

      const rerun = new ButtonBuilder()
        .setCustomId("rerun")
        .setLabel("Rerun")
        .setStyle(ButtonStyle.Success);

      if (!imageQueue.has(taskId)) {
        imageQueue.set(taskId, {
          status: "queued",
          position: queuePosition,
          input: input,
        });

        const queueMessage = new EmbedBuilder()
          .setColor("#3498db")
          .setDescription(
            `⌛ Your image is in the queue at position ${queuePosition}.(input: **${input}**) Please wait...`,
          )
          .setFooter({ text: "Task ID: " + taskId });

        const queueReply = await interaction.reply({ embeds: [queueMessage] });

        const response = await fetchData(
          "https://api-inference.huggingface.co/models/openskyml/dalle-3-xl",
          JSON.stringify({ inputs: input }),
          "blob",
        );

        if (response?.error) {
          imageQueue.delete(taskId);

          const errorEmbed = new EmbedBuilder()
            .setColor("#e74c3c")
            .setDescription("❌ Error: " + response.error)
            .setFooter({ text: "Task ID: " + taskId });
          await queueReply.edit({ embeds: [errorEmbed], components: [new ActionRowBuilder().addComponents(rerun)] });
          return;
        }

        console.log(response);
        if (response.type === "application/json") {
          imageQueue.delete(taskId);
          const cannotLoad = new EmbedBuilder()
            .setColor("#e74c3c")
            .setDescription(
              "❌ Cannot load the image. Got `application/json` response, instead of `image` (HF Model is still loading). Please try again later or try another prompt",
            )
            .setFooter({ text: "Task ID: " + taskId });
          await queueReply.edit({ embeds: [cannotLoad], components: [new ActionRowBuilder().addComponents(rerun)] });
          return;
        }

        const imageBuffer = await response.arrayBuffer();
        const image = new AttachmentBuilder(
          Buffer.from(imageBuffer),
          "image.png",
        );

        const newEmbed = new EmbedBuilder()
          .setDescription(
            `✅ Generated img "**${input}**" requested from input by **${interaction.user.username}**`,
          )
          .setColor("#12ff00");
        if (interaction.channel.nsfw)
          newEmbed.setFooter({
            text: "WARNING! Watch out your prompts. The bot can generate NSFW image",
          });

        const botMessage = await queueReply.edit({
          embeds: [newEmbed],
          files: [image],
        });

        const download = new ButtonBuilder()
          .setURL(botMessage.attachments.first().url)
          .setLabel("Download")
          .setStyle(ButtonStyle.Link);

        await botMessage.edit({
          components: [
            {
              type: 1,
              components: [download, like, dislike, deleteAttachment],
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

        imageQueue.set(taskId, { status: "completed" });
        imageQueue.delete(taskId);
      }
    } catch (e) {
      console.error(e);
    }
  },
};
