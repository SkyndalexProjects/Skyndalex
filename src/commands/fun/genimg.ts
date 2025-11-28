import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	MessageFlags,
	ButtonBuilder,
	ButtonStyle,
	TextDisplayBuilder,
	ContainerBuilder,
	ActionRowBuilder,
	AttachmentBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { Client } from "@gradio/client";
import { handleError } from "../../utils/index.js";
import * as process from "node:process";
import {
	HuggingFaceErrorData,
	HuggingFaceSpaceData,
} from "../../types/index.js";
import * as console from "node:console";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
    // TODO: validation and error handling

    const getDiscordAccounts = await client.prisma.account.findFirst({
        where: {
            accountId: interaction.user.id,
            providerId: "discord"
        }
    })

    if (getDiscordAccounts) {
        const getHuggingfaceAccount = await client.prisma.account.findFirst({
            where: {
                userId: getDiscordAccounts.userId,
                providerId: "huggingface"
            }
        });

        await interaction.deferReply();
        const prompt = interaction.options.getString("prompt");
        const image = interaction.options.getAttachment("image");
        const imageBlob = image
            ? await fetch(image.url).then((res) => res.blob())
            : null;
        console.log("Image attachment:", image);


        if (
            !getHuggingfaceAccount ||
            !getHuggingfaceAccount.accessToken ||
            getHuggingfaceAccount.accessToken.length <= 0
        ) {
            const authorizeButton = new ButtonBuilder()
                .setLabel("Authorize")
                .setStyle(ButtonStyle.Link)
                .setURL(
                    process.env.OAUTH_TO_HUGGINGFACE as string,
                );
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                authorizeButton,
            );

            const container = new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("Authorization required."),
                )
                .setAccentColor(0xffff00);

            return interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container, row],
            });
        }

        let defaultModel;
        let apiParameters;

        if (imageBlob) {
            defaultModel = "black-forest-labs/FLUX.1-Kontext-Dev";
            apiParameters = {
                input_image: imageBlob,
                prompt,
                seed: 0,
                randomize_seed: true,
                guidance_scale: 1,
                steps: 1,
            };
        } else {
            defaultModel = "black-forest-labs/FLUX.1-dev";
            apiParameters = {
                prompt,
                seed: 0,
                randomize_seed: true,
                width: 1024,
                height: 1024,
                guidance_scale: 3.5,
                num_inference_steps: 28,
            };
        }

        const app = await Client.connect(defaultModel, {
            hf_token: getHuggingfaceAccount?.accessToken,
        }).catch((error: Error) => {
            console.error("Error connecting to HuggingFace:", error);
            handleError(client, error, interaction);
            return null;
        });

        const result: HuggingFaceSpaceData = await app
            .predict("/infer", apiParameters)
            .catch((error: HuggingFaceErrorData) => {
                console.log(error);
                if (error) {
                    const authorizeButton = new ButtonBuilder()
                        .setLabel("Authorize")
                        .setStyle(ButtonStyle.Link)
                        .setURL(
                            process.env.OAUTH_TO_HUGGINGFACE ?? "https://default-auth-url.com",
                        );
                    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                        authorizeButton,
                    );

                    let errorMessage =
                        "The token you were using is already used up. To use the command again, you must log in via Huggingface. It is **free**, Skyndalex is in no way associated with this platform.";
                    if (error.title === "ZeroGPU quota exceeded") {
                        errorMessage =
                            `**ZeroGPU quota exceeded**\n` +
                            `To continue, you must wait for the quota to reset or upgrade your Huggingface account. You can also try again later. Or, try using a different account.`;
                    } else {
                        console.error(error);
                        errorMessage = `**Error occurred**\n${error.message || "Unknown error"}\n\n...`;
                    }

                    const container = new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(errorMessage),
                        )
                        .setAccentColor(0xffff00);

                    return interaction.editReply({
                        flags: MessageFlags.IsComponentsV2,
                        components: [container, row],
                    });
                }
            });

        if (result?.data) {
            const deleteButton = new ButtonBuilder()
                .setCustomId("delete-button")
                .setLabel("Delete")
                .setStyle(ButtonStyle.Danger);

            const regenerate = new ButtonBuilder()
                .setCustomId("regenerate")
                .setLabel("Regenerate")
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                deleteButton,
                regenerate,
            );

            const imageResponse = await fetch(result.data[0].url);
            const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
            const attachment = new AttachmentBuilder(imageBuffer, {
                name: "generated-image.png",
            });

            await interaction.editReply({
                content: `**${prompt}** - Generated by **${interaction.user.username}**\n-# :exclamation: | Please monitor your zeroGPU usage [here](<https://huggingface.co/settings/billing>). If guild is using daily image generator, you don't want to exceed your limit before daily generates.\n-# :ok_hand:  | Are you enjoying the bot? Consider voting [here](<https://top.gg/bot/${client.user!.id}/vote>) to help us grow!`,
                components: [row],
                files: [attachment],
            });
        } else {
            return null;
        }
    }
}

export const data = new SlashCommandBuilder()
	.setName("genimg")
	.setDescription("Generate an image using AI!")
	.addStringOption((option) =>
		option
			.setName("prompt")
			.setDescription("Describe the image you want to generate")
			.setRequired(true),
	)
	.addAttachmentOption((option) =>
		option
			.setName("image")
			.setDescription("An image to use as a reference for the generation"),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
