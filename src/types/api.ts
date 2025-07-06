export interface HuggingfaceRouterData {
	error?: string;
	id: string;
	object: string;
	created: number;
	model: string;
	choices: Array<{
		index: number;
		message: {
			content: string;
			role?: string;
		};
		finish_reason: string;
		content_filter_results: {
			[key: string]: unknown;
		};
	}>;
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
		prompt_tokens_details: {
			audio_tokens: number;
			cached_tokens: number;
		};
		completion_tokens_details: {
			audio_tokens: number;
			reasoning_tokens: number;
			accepted_prediction_tokens: number;
			rejected_prediction_tokens: number;
		};
	};
	system_fingerprint: string;
}
export interface HuggingFaceSpaceData {
	data: Array<{
		path: string;
		url: string;
		size: number | null;
		orig_name: string;
		mime_type: string | null;
		is_stream: boolean;
		meta: {
			_type: string;
			[key: string]: unknown;
		};
	}>;
	input?: {
		prompt?: string;
		instruction?: string;
		negative_prompt?: string | null;
		use_negative_prompt?: boolean;
		style?: string;
		seed?: number;
		width?: number;
		height?: number;
		width_input?: number;
		height_input?: number;
		guidance_scale?: number;
		guidance_scale_input?: number;
		img_guidance_scale_input?: number;
		randomize_seed?: boolean;
		scheduler?: string;
		num_inference_steps?: number;
		image_input_1?: unknown;
		image_input_2?: unknown;
		image_input_3?: unknown;
		cfg_range_start?: number;
		cfg_range_end?: number;
		num_images_per_prompt?: number;
		max_input_image_side_length?: number;
		max_pixels?: number;
		seed_input?: number;
	};
	error?: string;
	status?: string;
	duration?: number;
	average_duration?: number;
}
export interface HuggingFaceErrorData {
	type: string;
	endpoint: string;
	fn_index: number;
	time: Date | string;
	original_msg?: unknown;
	queue: boolean;
	title: string;
	message: string;
	visible: boolean;
	duration: number;
	stage: string;
	code?: string;
	success: boolean;
}
