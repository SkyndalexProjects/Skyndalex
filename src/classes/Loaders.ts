import { readdir } from "node:fs/promises";
import {ChatInputCommandInteraction, Collection, SlashCommandBuilder} from "discord.js";
import type { SkyndalexClient } from "./Client";

interface Command {
    data: SlashCommandBuilder;
    run: (client: SkyndalexClient, interaction: ChatInputCommandInteraction) => Promise<void>;
}
export class Loaders {
    async loadCommands(path: string): Promise<Collection<string, Command>> {
        const commands = new Collection<string, Command>();
        const categories = await readdir(new URL(path, import.meta.url));
        for (const category of categories) {
            const commandFiles = await readdir(new URL(`${path}/${category}`, import.meta.url));
            for (const command of commandFiles) {
                const commandFile = await import(`${path}/${category}/${command}`);
                commands.set(commandFile.data.name, commandFile)
            }
        }

        return commands;
    }
    async loadEvents(client: SkyndalexClient, path: string) {
        const files = await readdir(new URL(path, import.meta.url));
        for (const file of files) {
            if (file.split(".")[1] !== "ts" && !file.split(".")[2]) continue;
            const event = await import(`${path}/${file}`);
            const name = file.split(".")[0];
            client.on(name, (...events) => event[name](client, ...events));
        }
    }
}