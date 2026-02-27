import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("how")
	.setDescription("How is....")
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
