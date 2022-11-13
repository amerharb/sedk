import { BinderStore } from '../binder'
import { Artifacts } from '../steps/BaseStep'
import { BuilderData } from '../builder'

export interface IStatementGiver {
	getStmt(data: BuilderData, artifacts: Artifacts, binderStore: BinderStore): string
}
