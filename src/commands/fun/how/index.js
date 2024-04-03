import {
  ActionRowBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
export const data = new SlashCommandBuilder()
  .setName("how")
  .setDescription("How?");

// TODO: make the subcommands handling work for user apps