import { readdir } from "fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Collection } from "discord.js";

export const commands = new Collection();

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function loadCommands(path = "../commands") {
  const files = await readdir(resolve(__dirname, path), {
    withFileTypes: true,
  });

  const filesMap = files.map(async (file) => {
    if (file.isFile() && file.name.endsWith(".js")) {
      const { default: command } = await import(`${path}/${file.name}`);
      commands.set(command.data.name, command);
    } else if (file.isDirectory()) {
      await loadCommands(`${path}/${file.name}`);
    }
  });

  await Promise.all(filesMap);
}

export async function onCommandInteraction(client, interaction) {
  const command = commands.get(interaction.commandName);
  if (!command)
    return interaction.reply({
      content: `Command \`${command}\` not found!`,
      ephemeral: true,
    });

  try {
    await command.execute(client, interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: `There was an error while executing this command!\n\n\`\`\`${error}\`\`\``,
      });
    } else {
      await interaction.reply({
        content: `There was an error while executing this command!\n\n\`\`\`${error}\`\`\``,
      });
    }
  }
}
