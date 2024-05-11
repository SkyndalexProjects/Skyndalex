import {
	type ColorResolvable,
	EmbedBuilder as embedBuilder,
	type APIEmbedField,
} from "discord.js";
import type { LocaleFieldOptions } from "../../types/structures";
import type { SkyndalexClient } from "../Client";
export class EmbedBuilder extends embedBuilder {
	locale: string;
	constructor(
		private readonly client: SkyndalexClient,
		locale: string,
	) {
		super();
		this.locale = locale;
		this.setTimestamp();
	}

	mapField(field: LocaleFieldOptions) {
		return {
			name:
				field.rawName ??
				this.client.i18n.t(field.name, {
					lng: this.locale,
					...field.nameArgs,
				}),
			value:
				field.rawValue ??
				this.client.i18n.t(field.value, {
					lng: this.locale,
					...field.valueArgs,
				}),
			inline: field.inline,
		};
	}
	setTitle(title: string, args = {}): this {
		return super.setTitle(
			this.client.i18n.t(title, { lng: this.locale, ...args }),
		);
	}

	setDescription(description: string, args = {}): this {
		super.setDescription(
			this.client.i18n.t(description, { lng: this.locale, ...args }),
		);
		return this;
	}
	setFooter({
		text,
		textArgs,
		iconURL,
	}: {
		text: string;
		textArgs?: Record<string, string>;
		iconURL?: string;
	}): this {
		return super.setFooter({
			text: this.client.i18n.t(text, {
				lng: this.locale,
				...textArgs,
			}) as string,
			iconURL,
		});
	}
	setColor(color: ColorResolvable): this {
		return super.setColor(color);
	}
	addFields(fields: APIEmbedField[]) {
		return super.setFields(fields.map((field) => this.mapField(field)));
	}
}
