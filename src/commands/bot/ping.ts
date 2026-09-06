import { Client } from "@gradio/client";
import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
export async function run(
	_client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	// await interaction.deferReply();
	//
	// const reply = await interaction.fetchReply();
	//
	// if (!reply) {
	// 	return interaction.editReply({ content: "Failed to measure latency." });
	// }
	//
	// const locale = interaction.locale ?? "en-US";
	//
	// const wsLatency = client.ws.ping;
	// const interactionTimestamp = interaction.createdTimestamp;
	// const roundtrip = reply.createdTimestamp - interactionTimestamp;
	//
	// const latencyBar = buildProgressBar(roundtrip, 500);
	// const wsBar = buildProgressBar(wsLatency, 500);
	//
	// const latencyColor =
	// 	roundtrip < 100 ? 0x57f287 : roundtrip < 250 ? 0xfee75c : 0xed4245;
	//
	// const embed = new EmbedBuilder(client, locale)
	// 	.setTitle("info.ping.title")
	// 	.setColor(latencyColor)
	// 	.addFields(
	// 		{
	// 			name: "info.ping.roundtrip_latency",
	// 			rawValue: `${latencyBar} \`${roundtrip}ms\``,
	// 			inline: false,
	// 		},
	// 		{
	// 			name: "info.ping.websocket_latency",
	// 			rawValue: `${wsBar} \`${wsLatency}ms\``,
	// 			inline: false,
	// 		},
	// 	)
	// 	.setTimestamp();
	//
	// await interaction.editReply({ embeds: [embed] });
	// const getDiscordAccounts = await client.prisma.account.findFirst({
	// 	where: {
	// 		accountId: interaction.user.id,
	// 		providerId: "discord",
	// 	},
	// });
	//
	// const getHuggingfaceAccount = await client.prisma.account.findFirst({
	// 	where: {
	// 		userId: getDiscordAccounts.userId,
	// 		providerId: "huggingface",
	// 	},
	// });
	//
	// const response = await fetch(
	// 	"https://huggingface.co/api/whoami-v2",
	// 	{
	// 		headers: {
	// 			Authorization:
	// 				`Bearer ${getHuggingfaceAccount.accessToken}`
	// 		}
	// 	}
	// );
	//
	// console.log(await response.json());
	/*
	Qwen/Qwen2.5-VL-32B-Instruct
	 */
	const app = await Client.connect("Qwen/Qwen2.5-VL-32B-Instruct");
	const api = await app.view_api();
	console.log(JSON.stringify(api), null, 2);
	await interaction.reply(JSON.stringify(api).slice(0, 2000));
}

export const data = new SlashCommandBuilder()
	.setName("ping")
	.setDescription("Check bot latency and connection status.")
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
