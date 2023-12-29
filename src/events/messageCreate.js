import { EmbedBuilder } from "discord.js";
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

  if (
    message.channel.id === getCurrentSettings[0]?.aiChannel &&
    !message.author.bot
  ) {
    if (message.content.startsWith("//")) return;
    if (!getWhitelist[0]?.whitelisted)
      return message.reply(
        "❌ | This guild is not whitelisted. Please contact the server owner to whitelist this channel.\n\nSupport: [`here`](https://discord.gg/BknGx3NuHJ)",
      );

    let response;

    if (message.attachments.size === 1) {
      const sentMessage = await message.reply(
        "<a:4704loadingicon:1183416396223352852> Running...",
      );

      response = await fetchData(
        "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
        message.attachments.first().url,
        "json",
      );
      await sentMessage.edit(response[0]?.generated_text);
    } else if (message.attachments.size > 1) {
      const sentMessage = await message.reply(
        "<a:4704loadingicon:1183416396223352852> Running...",
      );

      let responseMessages = [];
      const queueMessage = await message.channel.send({
        content: "🔄 Generating images. This may take a while...",
      });

      for (const [key, attachment] of message.attachments) {
        response = await fetchData(
          "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
          attachment.url,
          "json",
        );

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

      await createEmbedPaginator(message, generateEmbed, totalPages);

      // Delete the queue message
      await queueMessage.delete();
    }
  }
}

export async function fetchData(url, options, responseType) {
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
      method: "POST",
      body: options,
    });

    if (responseType === "json") return await response.json();
    if (responseType === "blob") return await response.blob();
  } catch (error) {
    console.log(error);
  }
}
