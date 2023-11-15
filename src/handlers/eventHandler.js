import { readdir } from "fs/promises";
import chalk from "chalk";

export default async function loadEvents(client) {
  const jsEventFiles = (await readdir("./events")).filter((file) =>
    file.endsWith(".js"),
  );

  for (const file of jsEventFiles) {
    const { default: event } = await import(`../events/${file}`);
    const eventName = file.slice(0, -3);
    client.on(eventName, (...args) => event(client, ...args));
  }
}
