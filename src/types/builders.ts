import type {
    ActionRowBuilder,
    ButtonBuilder,
    ContextMenuCommandBuilder,
    EmbedBuilder,
    ModalBuilder,
    SelectMenuBuilder,
    SlashCommandAttachmentOption,
    SlashCommandBooleanOption,
    SlashCommandBuilder,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandMentionableOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    SlashCommandUserOption,
    TextInputBuilder
} from 'discord.js';

export type CommandResolvable =
    | SlashCommandBuilder
    | SlashCommandSubcommandBuilder
    | ContextMenuCommandBuilder
    | SlashCommandSubcommandGroupBuilder;

export type OptionResolvable =
    | SlashCommandAttachmentOption
    | SlashCommandBooleanOption
    | SlashCommandChannelOption
    | SlashCommandIntegerOption
    | SlashCommandMentionableOption
    | SlashCommandNumberOption
    | SlashCommandRoleOption
    | SlashCommandStringOption
    | SlashCommandUserOption;

export type ComponentResolvable =
    | ActionRowBuilder
    | ButtonBuilder
    | ModalBuilder
    | TextInputBuilder
    | SelectMenuBuilder;

export type ApplicationCommandBuilderResolvable = CommandResolvable | OptionResolvable;
export type BuilderResolvable = ApplicationCommandBuilderResolvable | ComponentResolvable | EmbedBuilder;