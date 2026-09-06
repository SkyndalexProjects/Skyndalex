import { TextDisplayBuilder as textDisplayBuilder } from "discord.js";
import type { SkyndalexClient } from "#classes";

export class TextDisplayBuilder extends textDisplayBuilder {
	locale: string;

	constructor(
		private readonly client: SkyndalexClient,
		locale: string,
	) {
		super();
		this.locale = locale;
	}

	setContent(content: string, args = {}): this {
		return super.setContent(
			this.client.i18n.t(content, { lng: this.locale, ...args }),
		);
	}

	setRawContent(content: string): this {
		return super.setContent(content);
	}
}
