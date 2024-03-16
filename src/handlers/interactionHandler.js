import { readdir } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export default async function loadInteractions(
  client,
  path = "../interactions",
) {
  try {
    const files = await readdir(resolve(__dirname, path), {
      withFileTypes: true,
    })

    const filesMap = files.map(async (file) => {
      if (file.isFile() && file.name.endsWith(".js")) {
        const { default: interaction } = await import(`${path}/${file.name}`);

        const interactionName =
          interaction.default?.name?.toLowerCase()?.replaceAll(" ", "_") ||
          interaction.default?.customId;

        client.interactions.set(interactionName, interaction.default);
      } else if (file.isDirectory()) {
        await loadInteractions(client, `${path}/${file.name}`);
      }
    });
  } catch(e) {
    console.error(e)
  }
}
