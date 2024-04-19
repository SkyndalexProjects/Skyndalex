import type { SkyndalexClient } from "../classes/Client";

export async function ready(client: SkyndalexClient) {
	await client.application.commands.set(
		client.commands.map((command) => command.data.toJSON()),
	);

	client.logger.log(`Ready in ${((performance.now() - client.createdAt) / 1000).toFixed(2)}s`);
}
