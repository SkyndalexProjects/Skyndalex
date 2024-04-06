import { HfInference } from "@huggingface/inference";
import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
} from "discord.js";

const hf = new HfInference(process.env.HF_TOKEN);
export async function run(client, interaction) {
	const clientId = interaction.customId.split("-")[1];
	const id = interaction.customId.split("-")[2];

	client.prisma.$executeRaw`DROP DATABASE custombot_${clientId};`;
	await client.prisma.customBots.delete({
		where: {
			id_clientId: {
				clientId: clientId,
				id: Number(id),
			},
		},
	});

	return interaction.update({
		content: "Custom bot deleted!",
		embeds: [],
		ephemeral: true,
	});
}
