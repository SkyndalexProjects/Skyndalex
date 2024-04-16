import type { SkyndalexClient } from "../classes/Client";

export async function ready(client: SkyndalexClient) {
	await client.application.commands.set(
		client.commands.map((command) => command.data.toJSON()),
	);
	console.log("Ready");
}
