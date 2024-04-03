import { SlashCommandSubcommandBuilder } from "discord.js";
import fetch from "node-fetch";
export async function run(client, interaction) {
  const id = interaction.options.getString("radio").split("-")[1];

  await client.prisma.settings.upsert({
    where: {
      guildId: interaction.guild.id,
    },
    create: {
      guildId: interaction.guild.id,
      radioStation: id,
    },
    update: {
      radioStation: id,
    },
  });

  await interaction.reply({
    content: `Radio station set to ${interaction.options.getString("radio")}`,
    ephemeral: true,
  });
}
export async function autocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused();
    const url = `https://radio.garden/api/search?q=${focusedValue}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "accept: application/json",
      },
    });
    const json = await response.json();

    console.log(json.hits.hits[0]);

    let data = [];
    for (let i in json.hits.hits) {
      if (json.hits.hits[i]._source.type === "channel") {
        data.push(
          `${json.hits.hits[i]._source.title}-${
            json.hits.hits[i]._source.url.split("/")[3]
          }`,
        );
      }
      console.log(data.map((choice) => ({ name: choice, value: choice })));
    }

    await interaction.respond(
      data.map((choice) => ({ name: choice, value: choice })),
    );
  } catch (error) {
    console.error("Error during autocomplete:", error);
  }
}
export const data = new SlashCommandSubcommandBuilder()
  .setName("radio-station")
  .setDescription("Set the radio station for the bot")
  .addStringOption((option) =>
    option
      .setName("radio")
      .setDescription("Radio station")
      .setRequired(true)
      .setAutocomplete(true),
  );