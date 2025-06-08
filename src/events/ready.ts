import type { SkyndalexClient } from "#classes";
import { deploy } from "#utils";

export async function ready(client: SkyndalexClient) {
	const commands = await deploy(client);
	if (client.user) {
		console.log(`[Bot] :: ${client.user.username} is online!`);
	} else {
		console.error("[Bot] :: Client user is null.");
	}
}
