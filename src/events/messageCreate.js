import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import { config } from "dotenv";
import createEmbedPaginator from "../functions/createEmbedPaginator.js";

config();

export default async function messageCreate(client, message) {
  const getWhitelist = await client.prisma.whitelist.findMany({
    where: {
      guildId: message.guild.id,
    },
  });
  const getCurrentSettings = await client.prisma.settings.findMany({
    where: {
      guildId: message.guild.id,
    },
  });
  if (getWhitelist[0]?.whitelisted) {
    if (
      message.channel.id === getCurrentSettings[0]?.aiChannel &&
      !message.author.bot
    ) {
      if (message.content.startsWith("//")) return;

      if (message.content.startsWith("--genimg")) {
        await message.channel.sendTyping();

        const sentMessage = await message.reply(
          "<a:4704loadingicon:1183416396223352852> Running image generation...",
        );

        if (!message.content) return;
        const response = await imgGen({ inputs: message.content });
        console.log(response);

        const imageBuffer = await response.arrayBuffer();
        const image = new AttachmentBuilder(
          Buffer.from(imageBuffer),
          "image.png",
        );
        await sentMessage.edit({ content: " ✅ Image generated", files: [image] });
      } else if (message.content) {
        const sentMessage = await message.reply(
          "<a:4704loadingicon:1183416396223352852> Running text generation...",
        );
        await message.channel.sendTyping();

        const result = await textGen(message.content);
        const response = result.generated_text;

        await sentMessage.edit(response);
      } else if (message.attachments.size === 1) {
        const sentSingleAttachment = await message.reply(
          "<a:4704loadingicon:1183416396223352852> Running single image classification...",
        );

        await message.channel.sendTyping();

        const response = await imgClassification(
          message.attachments.first().url,
        );
        console.log(response);
        await sentSingleAttachment.edit(response[0]?.generated_text);
      } else if (message.attachments.size > 1) {
        await message.reply(
          "<a:4704loadingicon:1183416396223352852> Running multiple image classification...",
        );

        let responseMessages = [];

        for (const [key, attachment] of message.attachments) {
          const response = await imgClassification(attachment.url);
          const generatedText = response[0]?.generated_text;
          const url = attachment.url;

          responseMessages.push({
            generated_text: generatedText,
            url: url,
          });
        }

        const totalPages = responseMessages.length;
        const items = responseMessages;

        const generateEmbed = async (page) => {
          const msgs = items[page];
          const embed = new EmbedBuilder()
            .setTitle(`Image Classification ${page + 1} of ${items.length}`)
            .setDescription(msgs.generated_text)
            .setImage(msgs.url)
            .setColor("Green");

          return embed;
        };

        // Assuming you have a function createEmbedPaginator implemented in your code
        await createEmbedPaginator(message, generateEmbed, totalPages);
      }
    }
  }
  async function textGen(input) {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
        {
          headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
          method: "POST",
          body: JSON.stringify({
            inputs: {
              text: input,
            },
          }),
        },
      );
      return await response.json();
    } catch (error) {
      console.log(error);
    }
  }

  async function imgGen(input) {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/openskyml/dalle-3-xl",
        {
          headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
          method: "POST",
          body: JSON.stringify(input),
        },
      );
      return await response.blob();
    } catch (error) {
      console.log(error);
    }
  }

  async function imgClassification(input) {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
        {
          headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
          method: "POST",
          body: input,
        },
      );
      return await response.json();
    } catch (error) {
      console.log(error);
    }
  }
}
