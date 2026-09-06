import { readdir } from "node:fs/promises";
import { Collection } from "discord.js";
import type { SkyndalexClient } from "#classes";
import type { Command, Component } from "../types/index.js";

export class Loaders {
	async loadFolder<T>(
		folder: string | URL,
	): Promise<{ files: Collection<string, T>; directoriesFound: string[] }> {
		const files = new Collection<string, T>();
		const directory = await readdir(folder).catch((_e) => {});
		const directoriesFound: string[] = [];
		if (!directory) return { files, directoriesFound };
		for (const file of directory) {
			if (!file.endsWith(".ts") && !file.endsWith(".js")) {
				directoriesFound.push(file);
				continue;
			}
			const path = `${folder}/${file}`;
			const data = await import(path);
			files.set(file.split(".")[0], data);
		}
		return { files, directoriesFound };
	}
	async loadCommands(path: string): Promise<Collection<string, Command>> {
		const commands = new Collection<string, Command>();
		const dir = await readdir(new URL(path, import.meta.url));

		for (const category of dir) {
			const { files, directoriesFound } = await this.loadFolder(
				new URL(`${path}/${category}`, import.meta.url),
			);
			for (const [name, command] of files) {
				const commandWithCategory = {
					...(command as object),
					category,
				};
				commands.set(name, commandWithCategory as unknown as Command);
			}

			for (const directory of directoriesFound) {
				const { files } = await this.loadFolder(
					new URL(`${path}/${category}/${directory}`, import.meta.url),
				);

				for (const [name, command] of files) {
					const commandWithCategory = {
						...(command as object),
						category,
					};
					commands.set(
						`${directory}/${name}`,
						commandWithCategory as unknown as Command,
					);
				}
			}
		}
		return commands;
	}
	async loadComponents(path: string): Promise<Collection<string, Component>> {
		const components = new Collection<string, Component>();
		const files = await readdir(new URL(path, import.meta.url));

		for (const file of files) {
			if (!file.endsWith(".js") && !file.endsWith(".ts")) continue;
			const component = await import(`${path}/${file}`);
			const name = file.split(".")[0];
			components.set(name, component);
		}
		return components;
	}
	async loadEvents(client: SkyndalexClient, path: string) {
		const files = await readdir(new URL(path, import.meta.url));
		for (const file of files) {
			if (!file.endsWith(".js") && !file.endsWith(".ts")) continue;
			const event = await import(`${path}/${file}`);
			const name = file.split(".")[0];
			client.on(name, (...events) => event[name](client, ...events));
		}
	}
}
