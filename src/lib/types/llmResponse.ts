export interface LlmResponse {
	content: string;
	metadata?: {
		latency: number;
		model: string;
	};
	error?: Error;
}

export const isLlmResponse = (response: unknown): response is LlmResponse => {
	return (
		typeof response === 'object' &&
		response !== null &&
		'content' in response &&
		typeof response.content === 'string'
	);
};
