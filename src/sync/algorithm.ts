export const LERP_FACTORS: Record<string, number> = {
	high: 0.25,
	medium: 0.18,
	low: 0.1,
}

export function findNextBeat(
	progressSec: number,
	beats: any[]
): { index: number; time: number } | null {
	// Binary search for first beat with start > progressSec
	let low = 0
	let high = beats.length - 1
	let result = -1
	while (low <= high) {
		const mid = (low + high) >> 1
		if (beats[mid].start > progressSec) {
			result = mid
			high = mid - 1
		} else {
			low = mid + 1
		}
	}
	if (result === -1) return null
	return { index: result, time: beats[result].start }
}

export function getTimeUntilNextDrop(videoTime: number, drops: number[], duration: number): number {
	for (const drop of drops) {
		if (drop > videoTime) return drop - videoTime
	}
	return duration - videoTime + drops[0]
}

/**
 * Given current state, computes the next lerp'd playback rate.
 */
export function computeNextRate(
	currentRate: number,
	progressSec: number,
	videoTime: number,
	beats: any[],
	headDrops: number[],
	videoDuration: number,
	perfLevel: 'low' | 'medium' | 'high',
	clampMax: number
): number {
	const lerpFactor = LERP_FACTORS[perfLevel] ?? LERP_FACTORS.high

	if (!beats?.length) return currentRate + (1 - currentRate) * lerpFactor

	let vt = videoTime % videoDuration
	if (vt < 0) vt = 0

	const nextBeat = findNextBeat(progressSec, beats)
	if (!nextBeat) return currentRate + (1 - currentRate) * lerpFactor

	const timeUntilBeat = nextBeat.time - progressSec
	if (timeUntilBeat < 0.005) return currentRate

	const timeUntilDrop = getTimeUntilNextDrop(vt, headDrops, videoDuration)
	const clampMin = 2 - clampMax
	const target = Math.max(clampMin, Math.min(clampMax, timeUntilDrop / timeUntilBeat))

	return currentRate + (target - currentRate) * lerpFactor
}
