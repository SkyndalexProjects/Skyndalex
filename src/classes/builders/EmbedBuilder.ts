import { SkyndalexClient } from "../Client";
import { BaseBuilder } from '../builders/bases/BaseBuilder';
import { EmbedBuilder as UnlocalizedBuilder, type LocalizationMap } from 'discord.js';

export class EmbedBuilder extends BaseBuilder<UnlocalizedBuilder> {
    constructor(client: SkyndalexClient, locale: keyof LocalizationMap) {
        super('responses');
        this.builder = new UnlocalizedBuilder();
        this.locale = locale;
        this.client = client;
    }

    setDescription(description: string, args: Record<string, any> = {}): this {
        this.builder.setDescription(args.raw ? description : this.getOne(description, this.locale, args));
        return this;
    }

    toJSON() {
        return this.builder.toJSON();
    }
}