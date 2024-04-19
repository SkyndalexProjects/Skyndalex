import { readdir } from "node:fs/promises";
import { Collection } from "discord.js";
import type { Command, Component } from "../types/structures";
import type { SkyndalexClient } from "./Client";
export class Loaders {
	async loadCommands(path: string): Promise<Collection<string, Command>> {
		const commands = new Collection<string, Command>();
		const categories = await readdir(new URL(path, import.meta.url));
		for (const category of categories) {
			const commandFiles = await readdir(
				new URL(`${path}/${category}`, import.meta.url),
			);
			for (const command of commandFiles) {
				const commandFile = await import(
					`${path}/${category}/${command}`
				);
				commands.set(commandFile.data.name, commandFile);
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
	async loadComponents(path: string): Promise<Collection<string, Component>> {
		const components = new Collection<string, Component>();
		const categories = await readdir(new URL(path, import.meta.url));
		for (const category of categories) {
			const componentFiles = await readdir(
				new URL(`${path}/${category}`, import.meta.url),
			);
			for (const component of componentFiles) {
				const componentFile = await import(
					`${path}/${category}/${component}`
				);
				const customId = component.split(".")[0];
				components.set(customId, componentFile);
			}
		}
		return components;
	}
}
