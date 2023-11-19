import { Artifacts, BaseStep } from '../BaseStep'

export abstract class BaseLimitStep extends BaseStep {
	getStepArtifacts(): Artifacts {
		return { tables: new Set(), columns: new Set() }
	}
}
