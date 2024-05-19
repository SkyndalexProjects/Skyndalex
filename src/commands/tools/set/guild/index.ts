import { SlashCommandSubcommandGroupBuilder } from "discord.js";

export const data = new SlashCommandSubcommandGroupBuilder()
	.setName("guild")
	.setDescription("Set guild config");
