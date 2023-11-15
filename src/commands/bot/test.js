import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import Gamedig from "gamedig";

export default {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("test command"),

  async execute(client, interaction) {
    const state = await Gamedig.query({
      type: "minecraft",
      host: "mc.hypixel.net",
    });

    console.log(state);
    const width = 400;
    const height = 400;
    const backgroundColor = "white";
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColor,
    });

    const config = {
      type: "bar",
      title: "test",
      data: {
        datasets: [
          {
            data: [{ id: "Test", nested: { value: 1 } }],
          },
        ],
      },
      options: {
        parsing: {
          xAxisKey: "id",
          yAxisKey: "nested.value",
        },
      },
    };

    const image = await chartJSNodeCanvas.renderToBuffer(config);
    const attachment = new AttachmentBuilder(image, "test.png");

    await interaction.reply({ files: [attachment] });
  },
};
