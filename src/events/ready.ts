import type { SkyndalexClient } from "#classes";

export async function ready(client: SkyndalexClient) {
	if (client.user) {
		console.log(`[Bot] :: ${client.user.username} is online!`);
	} else {
		console.error("[Bot] :: Client user is null.");
	}
}
