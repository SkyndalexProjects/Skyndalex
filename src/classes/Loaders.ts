import { lstatSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { Collection } from "discord.js";
import type { Command, Component } from "../types/structures";
import type { SkyndalexClient } from "./Client";
export class Loaders {
	constructor(private readonly client: SkyndalexClient) {
		this.client = client;
	}
	async loadCommands(path: string): Promise<Collection<string, Command>> {
		const commands = new Collection<string, Command>();
		const dirs = await readdir(new URL(path, import.meta.url));

		for (const dir of dirs) {
			await this.loadCommandsAndSubcommands(`${path}/${dir}`);
		}
		return commands;
	}
	async loadCommandsAndSubcommands(path: string, prefix?: string) {
		const dirs = await readdir(new URL(path, import.meta.url));

		for (const dir of dirs) {
			const lstat = lstatSync(new URL(`${path}/${dir}`, import.meta.url));

			if (lstat.isDirectory()) {
				await this.loadCommandsAndSubcommands(
					`${path}/${dir}`,
					prefix ? `${prefix}/${dir}` : dir,
				);
			} else {
				const command = await import(`${path}/${dir}`);

				this.client.commands.set(
					prefix
						? `${prefix}/${dir.split(".")[0]}`
						: dir.split(".")[0],
					command,
				);
			}
		}
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
