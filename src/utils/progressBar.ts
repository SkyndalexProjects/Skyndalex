export function buildProgressBar(
	value: number,
	max: number,
	length: number = 10,
): string {
	const filled = Math.round((Math.min(value, max) / max) * length);
	const empty = length - filled;
	return `${"█".repeat(filled)}${"░".repeat(empty)}`;
}

export function buildResourceBar(used: number, total: number): string {
	const percentage = Math.round((used / total) * 100);
	const barLength = 10;
	const filledLength = Math.round((percentage / 100) * barLength);
	const bar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);
	return `${bar} ${percentage}%`;
}
