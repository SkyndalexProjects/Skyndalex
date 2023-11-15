import { readdir } from "fs/promises";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { Collection } from "discord.js";

export default async function loadInteractions(
  client,
  path = "../src/interactions",
) {
  const files = await readdir(path, { withFileTypes: true });

  for (const file of files) {
    const filePath = resolve(path, file.name);

    if (file.isDirectory()) {
      await loadInteractions(client, filePath);
    } else {
      const fileURL = pathToFileURL(filePath);
      const interaction = await import(fileURL);

      const interactionName =
        interaction.default?.name?.toLowerCase()?.replaceAll(" ", "_") ||
        interaction.default?.customId;

      client.interactions.set(interactionName, interaction.default);
    }
  }
}
