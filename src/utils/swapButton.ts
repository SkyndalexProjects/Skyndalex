import {
	ComponentType,
	type APIButtonComponentWithCustomId,
	type APIComponentInContainer,
	type APIComponentInMessageActionRow,
	type APIMessageTopLevelComponent,
} from "discord.js";

type Component =
	| APIMessageTopLevelComponent
	| APIComponentInContainer
	| APIComponentInMessageActionRow;

type ButtonReplacement =
	Pick<APIButtonComponentWithCustomId, "custom_id" | "style">
	& { label: string };

export function swapButton(
	components: readonly APIMessageTopLevelComponent[],
	targetCustomId: string,
	replacement: ButtonReplacement,
): APIMessageTopLevelComponent[] {
	return components.map(walk);

	function walk<T extends Component>(component: T): T {
		if (
			component.type === ComponentType.Button &&
			"custom_id" in component &&
			component.custom_id === targetCustomId
		) {
			return {
				...component,
				...replacement,
			} as T;
		}

		if ("components" in component) {
			return {
				...component,
				components: component.components.map(walk),
			} as T;
		}

		return component;
	}
}