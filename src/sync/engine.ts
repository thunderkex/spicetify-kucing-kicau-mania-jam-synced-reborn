import { APP_CONFIG } from '../config'
import { getSettingsSnapshot } from '../settings/settings'
import { computeNextRate } from './algorithm'
import { getCustomDrops, getCustomDuration } from '../settings/drops-editor'

export interface SyncState {
	playbackRate: number
}

export class PredictiveSyncEngine {
	private state: SyncState = {
		playbackRate: 1,
	}

	reset() {
		this.state = {
			playbackRate: 1,
		}
	}

	update(
		progressSec: number,
		currentVideoTime: number,
		audioData: any,
		perfLevel: 'low' | 'medium' | 'high' = 'high'
	): { playbackRate: number } {
		if (!audioData?.beats?.length) return { playbackRate: 1 }

		const clampMax = getSettingsSnapshot().syncClampMax ?? 1.35

		const beats = audioData.beats
		const headDrops = getCustomDrops() ?? APP_CONFIG.CAT_HEAD_DROPS
		const videoDuration = getCustomDuration() ?? APP_CONFIG.VIDEO_DURATION

		this.state.playbackRate = computeNextRate(
			this.state.playbackRate,
			progressSec,
			currentVideoTime,
			beats,
			headDrops,
			videoDuration,
			perfLevel,
			clampMax
		)

		return { playbackRate: this.state.playbackRate }
	}

	getState(): SyncState {
		return { ...this.state }
	}
}

export const syncEngine = new PredictiveSyncEngine()
