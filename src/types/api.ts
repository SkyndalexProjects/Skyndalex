export interface radioStationSearchQueryResult {
	hits: {
		hits: [
			{
				_id: string;
				_source: {
					code: string;
					subtitle: string;
					type: string;
					title: string;
					secure: boolean;
					url: string;
				};
			},
		];
	};
}
export interface radioStationData {
	error: string;
	data: {
		type: string;
		title: string;
		id: string;
		url: string;
		stream: string;
		website: string;
		secure: boolean;
		place: { id: string; title: string };
		country: { id: string; title: string };
	};
}
export interface ainasepicsAPI {
	url: string;
}
export interface randomDog {
	url: string;
}
export interface HuggingFaceSearchResult {
	id: string;
	modelId: string;
}
export interface HuggingFaceImage {
	generatedImage: ArrayBuffer;
}
export interface weatherData {
	current_condition: {
		FeelsLikeC: string;
		temp_C: string;
		humidity: string;
		windspeedKmph: string;
	};
}
export interface HuggingFaceText {
	generated_text: string;
}
export interface BotData {
	approximate_user_install_count: number;
}
export interface GroqResponse {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: Array<{
		index: 0;
		message: {
			content: string;
			role: string;
		}
		logprobs: null;
		finish_reason: string;
	}>
	error: {
		message: string;
		type: string;
		code: string
	}
}