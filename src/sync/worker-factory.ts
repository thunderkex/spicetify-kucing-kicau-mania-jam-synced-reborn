import { APP_CONFIG } from '../config'
import { cachedSettings } from '../settings/settings'
import ProcessorWorker from '../audio/processor.worker?worker'

export function createSyncWorker(): Worker | null {
	try {
		const worker = new ProcessorWorker()

		worker.postMessage({
			type: 'setConfig',
			data: {
				maxScale: cachedSettings.pulseIntensity ?? APP_CONFIG.VISUAL.MAX_SCALE,
				clampMax: cachedSettings.syncClampMax ?? 1.35,
			},
		})

		return worker
	} catch {
		return null
	}
}
