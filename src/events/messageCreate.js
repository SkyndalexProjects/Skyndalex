import { HfInference } from "@huggingface/inference";
import { config } from "dotenv";
const hf = new HfInference(process.env.HF_TOKEN);

config();
export default async function messageCreate(client, message) {
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

    let response;

    if (message.attachments.size === 1) {
      const sentMessage = await message.reply(
        "<a:4704loadingicon:1183416396223352852> Running image classification...",
      );

      response = await hf.imageToText({
        data: message.attachments.first().url,
        model: "Salesforce/blip-image-captioning-large",
        use_cache: false,
        wait_for_model: true,
      });
      console.log(response);
      await sentMessage.edit(response.generated_text);
    }
  }
}

export async function fetchData(url, input, responseType) {
  try {
    console.log({
      inputs: input,
      options: { wait_for_model: true, use_cache: false },
    });

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
