import {
	type APIMessageComponentEmoji,
	ButtonBuilder as buttonBuilder,
	type ButtonStyle,
} from "discord.js";
import type { SkyndalexClient } from "classes/Client";
export class ButtonBuilder extends buttonBuilder {
	locale: string;
	constructor(
		private readonly client: SkyndalexClient,
		locale: string,
	) {
		super();
		this.locale = locale;
	}

	setLabel(label: string): this {
		return super.setLabel(this.client.i18n.t(label, { lng: this.locale }));
	}
	setStyle(style: ButtonStyle): this {
		return super.setStyle(style);
	}
	setURL(url: string): this {
		return super.setURL(url);
	}
	setDisabled(disabled?: boolean): this {
		return super.setDisabled(disabled);
	}
	setEmoji(emoji: APIMessageComponentEmoji): this {
		return super.setEmoji(emoji);
	}
}
