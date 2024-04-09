import { HfInference } from "@huggingface/inference";
import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import find from "find-process";

const hf = new HfInference(process.env.HF_TOKEN);
export async function run(client, interaction) {
	const clientId = interaction.customId.split("-")[1];
	const id = interaction.customId.split("-")[2];

	client.prisma.$executeRaw`DROP DATABASE custombot_${clientId};`;

	const bot = await find("name", `customBot ${clientId}`);
	if (bot[0].pid) process.kill(bot[0].pid);

	await client.prisma.customBots.delete({
		where: {
			id_clientId: {
				clientId: clientId,
				id: Number(id),
			},
		},
	});

	const embed = new EmbedBuilder()
		.setDescription(`☑️ | Custombot deleted`)
		.setColor("Red");

	return interaction.update({
		embeds: [embed],
		ephemeral: true,
		components: [],
	});
}
