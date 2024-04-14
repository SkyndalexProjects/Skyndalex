import { SkyndalexClient } from "../../classes/Client";
import { ButtonInteraction } from "discord.js";

export async function run(client: SkyndalexClient, interaction: ButtonInteraction) {
    return interaction.reply({content: ":heart:", ephemeral: true});
}
