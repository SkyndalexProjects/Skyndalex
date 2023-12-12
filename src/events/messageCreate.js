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

  if (getWhitelist[0]?.whitelisted && message.channel.id === getCurrentSettings[0]?.aiChannel && !message.author.bot) {
    if (message.content.startsWith("//")) return;

    await message.channel.sendTyping();
    const sentMessage = await message.reply("<a:4704loadingicon:1183416396223352852> Running...");

    let response;

    const input = message.content.split("--genimg ")[1];
    console.log("input", input)

    if (message.content.startsWith("--genimg")) {
      try {
        if (!message.content) return;

        response = await fetchData("https://api-inference.huggingface.co/models/openskyml/dalle-3-xl", JSON.stringify({ inputs: input }), "blob");
        console.log("response", response)
        if (response?.error) return sentMessage.edit({ content: "❌ Error: " + response.error });
        if (response.type === "application/json") return sentMessage.edit({ content: `❌ Cannot load the image. Please try again later or try other prompt`, files: [] });

        const imageBuffer = await response.arrayBuffer();
        const image = new AttachmentBuilder(Buffer.from(imageBuffer), "image.png");
        await sentMessage.edit({ content: " ✅ Image generated", files: [image] });
      } catch (e) {
        console.log("e", e)
      }
    } else if (message.content) {
      response = await fetchData("https://api-inference.huggingface.co/models/microsoft/DialoGPT-large", { inputs: { text: input }, }, "json");
      await sentMessage.edit(response.generated_text);
    } else if (message.attachments.size === 1) {
      response = await fetchData("https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large", message.attachments.first().url, "json");
      console.log(response)
      await sentMessage.edit(response[0]?.generated_text);
    } else if (message.attachments.size > 1) {
      let responseMessages = [];

      for (const [key, attachment] of message.attachments) {
        response = await fetchData("https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large", attachment.url, "json");

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

async function fetchData(url, options, responseType) {
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