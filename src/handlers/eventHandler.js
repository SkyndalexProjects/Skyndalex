import { readdir } from "fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import path from "path"
export default async function loadEvents(client) {
  const files = await readdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../events"));

  for (const file of files) {
    if (file.endsWith(".js")) {
      const { default: event } = await import(`../events/${file}`);
      client.on(file.split(".")[0], event.bind(null, client));
    }
  }

}
