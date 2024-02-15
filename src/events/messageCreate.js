import { EmbedBuilder } from "discord.js";
import { config } from "dotenv";
import createEmbedPaginator from "../functions/createEmbedPaginator.js";
import { HfInference } from '@huggingface/inference'
const hf = new HfInference(process.env.HF_TOKEN)

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
        "<a:4704loadingicon:1183416396223352852> Running image classification...",
      );

      response = await hf.imageToText({
        data: message.attachments.first().url,
        model: 'Salesforce/blip-image-captioning-large',
        use_cache: false,
        wait_for_model: true
      })
      console.log(response)
      await sentMessage.edit(response.generated_text);
    }
  }
}

export async function fetchData(url, input, responseType) {
  try {
    console.log({ inputs: input, options: { wait_for_model: true, use_cache: false }})

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
      method: "POST",
      body: { inputs: input, options: { wait_for_model: 1, use_cache: 0 } },
    });

    if (responseType === "json") return await response.json();
    if (responseType === "blob") return await response.blob();
  } catch (error) {
    console.log(error);
  }
}
