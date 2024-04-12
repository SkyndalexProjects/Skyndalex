import { readdir } from "node:fs/promises";
import { Collection } from "discord.js";
import type { SkyndalexClient } from "./Client";

export class Loaders {
    async loadCommands(path: string) {
        const commands = new Collection()
        const categories = await readdir(path);

        for (const category of categories) {
            const commandFiles = await readdir(`${path}/${category}`);
            for (const command of commandFiles) {
                const commandFile = await import(`../commands/${category}/${command}`);
                commands.set(commandFile.data.name, commandFile)
            }
        }
    }
    async loadEvents(client: SkyndalexClient, path: string) {
        const files = await readdir(path);
        for (const file of files) {
            if (file.split(".")[1] !== "js" && !file.split(".")[2]) continue;
            const event = await import(`../events/${file}`);
            const name = file.split(".")[0];
            client.on(name, (...events) => event[name](client, ...events));
        }
    }
}
