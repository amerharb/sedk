import { IStatementGiver } from './IStatementGiver'
import { escapeBackTick } from './util'

export class Label implements IStatementGiver {
	public constructor(public readonly name: string) {
	}

	public getStmt(): string {
		return `\`${escapeBackTick(this.name)}\``
	}
}
