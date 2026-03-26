import { BinderStore } from '../binder.ts'
import { Artifacts } from '../steps/BaseStep.ts'
import { BuilderData } from '../builder.ts'

export interface IStatementGiver {
	getStmt(data: BuilderData, artifacts: Artifacts, binderStore: BinderStore): string
}
