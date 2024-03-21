import chalk from "chalk";
import { EmbedBuilder } from "discord.js";
import { onCommandInteraction } from "../handlers/commandHandler.js";

export default async function interactionCreate(client, interaction) {
  console.log(
    `${chalk.bold(
      chalk.underline(`[${new Date().toUTCString()}]`),
    )} ${chalk.yellowBright("[USED INTERACTION]")} ${chalk.blue(
      chalk.bold("(201)"),
    )} : user: ${chalk.bold(
      chalk.magenta(interaction.user.username),
    )} [${chalk.bold(
      chalk.magenta(interaction.user.id),
    )}] | guild: ${chalk.blueBright("1058882286210261073")} [${chalk.blue(
      interaction.guild?.name || "No guild. DM",
    )}] | channel: ${chalk.yellow(interaction.guild?.id || "No channel found (dm)")} [#${chalk.yellowBright(
      interaction.channel?.name,
    )}]`,
  );

  if (interaction.isCommand() || interaction.isAutocomplete())
    return await onCommandInteraction(client, interaction);

  const embedNotFound = new EmbedBuilder()
    .setTitle("Not found")
    .setDescription(
      "```❌ | This interaction was not found. Probably this function is refactored, or deleted. Please show this error on the support.```",
    )
    .addFields([
      { name: "Custom ID", value: `\`\`\`${interaction.customId}\`\`\`` },
    ])
    .setColor("Red");

  switch (true) {
    case interaction.isButton():
     {
        const button = client?.interactions
          .filter(
            (x) =>
              x.type === "button" && interaction.customId?.includes(x.customId),
          )
          ?.first();

        console.log("button", button)
        if (!button)
          return (
            console.log(`Button with ${interaction.customId} was not found.`) ||
            interaction.reply({ embeds: [embedNotFound], ephemeral: true })
          );
        button.run(client, interaction);
      }
      break;
    case interaction.isModalSubmit():
      {
        const modal = client.interactions.find(
          (x) => x.type === "modal" && interaction.customId === x.customId,
        );
        if (!modal)
          return (
            console.log(`Modal with ${interaction.customId} was not found.`) ||
            interaction.reply({ embeds: [embedNotFound] })
          );

        modal.run(client, interaction);
      }
      break;
    case interaction.isStringSelectMenu():
      const stringSelectOption = client.interactions.find(
        (x) =>
          x.type === "string_select_menu_value" &&
          interaction.customId === x.customId,
      );

      if (!stringSelectOption)
        return console.log(
          `Select option ${interaction.customId} was not found.`,
        );

      await stringSelectOption.run(client, interaction);
      break;
    case interaction.isChannelSelectMenu():
      const channelSelectOption = client.interactions.find(
        (x) =>
          x.type === "channel_select_menu_value" &&
          interaction.customId === x.customId,
      );

      if (!channelSelectOption)
        return console.log(
          `Select option ${interaction.customId} was not found.`,
        );

      await channelSelectOption.run(client, interaction);
      break;
    case interaction.isRoleSelectMenu():
      const roleSelectOption = client.interactions.find(
        (x) =>
          x.type === "role_select_menu_value" &&
          interaction.customId === x.customId,
      );

      if (!roleSelectOption)
        return console.log(
          `Select option ${interaction.customId} was not found.`,
        );

      await roleSelectOption.run(client, interaction);
      break;
  }
}
