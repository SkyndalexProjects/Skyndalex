import type { SkyndalexClient } from "classes/Client";
import { ModalBuilder as modalBuilder } from "discord.js";
export class ModalBuilder extends modalBuilder {
	locale: string;
	constructor(
		private readonly client: SkyndalexClient,
		locale: string,
	) {
		super();
		this.locale = locale;
	}
	setTitle(title: string): this {
		return super.setTitle(this.client.i18n.t(title, { lng: this.locale }));
	}
}
