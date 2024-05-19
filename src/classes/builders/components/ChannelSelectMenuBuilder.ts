import type { SkyndalexClient } from "classes/Client";
import { ChannelSelectMenuBuilder as channelSelectMenuBuilder } from "discord.js";
export class ChannelSelectMenuBuilder extends channelSelectMenuBuilder {
	locale: string;
	constructor(
		private readonly client: SkyndalexClient,
		locale: string,
	) {
		super();
		this.locale = locale;
	}
	setPlaceholder(label: string): this {
		return super.setPlaceholder(
			this.client.i18n.t(label, { lng: this.locale }),
		);
	}
}
