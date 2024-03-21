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
    });

    for (const file of files) {
      if (file.isFile() && file.name.endsWith(".js")) {
        const { default: interaction } = await import(`${path}/${file.name}`);
        // console.log(interaction);

        const key = `${interaction.type}-${interaction.customId}`;
        client.interactions.set(key, interaction);
      } else if (file.isDirectory()) {
        await loadInteractions(client, `${path}/${file.name}`);
      }
    }
  } catch (e) {
    console.error(e);
  }
}
