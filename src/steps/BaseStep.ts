import { FromItem } from './select-path/SelectFromStep'
import { ItemInfo } from '../ItemInfo'
import { ColumnLike } from './select-path/SelectStep'
import { BuilderData } from '../builder'
import { Condition, Expression, PrimitiveType } from '../models'
import { LogicalOperator } from '../operators'
import { ColumnNotFoundError, DeleteWithoutConditionError, TableNotFoundError } from '../errors'
import { BooleanColumn, Column, Table } from '../database'
import { isDeleteStep, isDeleteWhereStep } from '../util'

export enum Parenthesis {
	Open = '(',
	Close = ')',
}

export type Artifacts = { tables: ReadonlySet<Table>, columns: ReadonlySet<Column> }

export abstract class BaseStep {
	constructor(
		protected readonly data: BuilderData,
		public readonly prevStep: BaseStep|null,
	) {}

	public getSQL(): string {
		let result = this.getFullStatement({ tables: new Set(), columns: new Set() })
		if (this.data.option.throwErrorIfDeleteHasNoCondition) {
			//look if the path is DELETE and there is no WHERE step
			let foundDELETE = false
			let foundWHERE = false
			let step:BaseStep|null = this
			do {
				if (isDeleteStep(step))
					foundDELETE = true
				if (isDeleteWhereStep(step))
					foundWHERE = true
				step = step.prevStep
			} while (step !== null)
			if (foundDELETE && !foundWHERE) {
				throw new DeleteWithoutConditionError()
			}
		}
		if (this.data.option.useSemicolonAtTheEnd) result += ';'
		return result
	}

	protected getFullStatement(nextArtifacts: Artifacts): string {
		let result = ''
		const artifacts = this.mergeArtifacts(this.getFullArtifacts(), nextArtifacts)
		this.data.artifact = artifacts
		if (this.prevStep !== null) {
			const stmt = this.prevStep.getFullStatement(artifacts).trimRight()
			if (stmt !== '') {
				result += `${stmt} `
			}
		}
		result += this.getStepStatement(artifacts)
		return result
	}

	protected getFullArtifacts(): Artifacts {
		if (this.prevStep !== null) {
			return this.mergeArtifacts(this.getStepArtifacts(), this.prevStep?.getFullArtifacts())
		}
		return this.getStepArtifacts()
	}

	private mergeArtifacts(ud1: Artifacts, ud2: Artifacts): Artifacts {
		const tables = new Set([...ud1.tables, ...ud2.tables])
		const columns = new Set([...ud1.columns, ...ud2.columns])
		return { tables, columns }
	}

	public abstract getStepStatement(artifacts: Artifacts): string

	protected abstract getStepArtifacts(): Artifacts

	public getBindValues(): PrimitiveType[] {
		return [...this.data.binderStore.getValues()]
	}

	public cleanUp() {
		this.data.binderStore.cleanUp()
	}

	protected static getTable(item: FromItem): Table {
		if (item instanceof Table)
			return item
		else
			return item.table
	}

	protected throwIfTableNotInDb(table: Table) {
		if (!this.data.database.hasTable(table))
			throw new TableNotFoundError(`Table: "${table.name}" not found`)
	}

	// TODO: refactor this call the way it been call or itself
	protected throwIfColumnsNotInDb(columns: (ItemInfo|ColumnLike)[]) {
		for (const item of columns) {
			if (
				item instanceof Expression
				|| item instanceof ItemInfo
			) {
				this.throwIfColumnsNotInDb(item.getColumns())
				continue
			}
			// after this, item is type Column
			if (!this.data.database.hasColumn(item)) {
				throw new ColumnNotFoundError(`Column: "${item.name}" not found in database`)
			}
		}
	}

	protected static addConditionParts(
		conditionArray: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
		cond1: Condition,
		op1?: LogicalOperator,
		cond2?: Condition,
		op2?: LogicalOperator,
		cond3?: Condition,
	) {
		if (op1 === undefined && cond2 === undefined) {
			conditionArray.push(cond1)
		} else if (op1 !== undefined && cond2 !== undefined) {
			conditionArray.push(Parenthesis.Open)
			conditionArray.push(cond1)
			conditionArray.push(op1)
			conditionArray.push(cond2)
			if (op2 !== undefined && cond3 !== undefined) {
				conditionArray.push(op2)
				conditionArray.push(cond3)
			}
			conditionArray.push(Parenthesis.Close)
		}
	}

	/**
	 * This function throws error if WhereParts Array where invalid
	 * it check the number of open and close parentheses in the conditions
	 */
	protected static throwIfConditionPartsInvalid(conditionsArray: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[]) {
		let pCounter = 0
		for (let i = 0; i < conditionsArray.length; i++) {
			if (conditionsArray[i] === Parenthesis.Open) {
				pCounter++
				if (i < conditionsArray.length - 1)
					if (conditionsArray[i + 1] === Parenthesis.Close) {
						throw new Error('Invalid conditions build, empty parentheses are not allowed')
					}
			}

			if (conditionsArray[i] === Parenthesis.Close)
				pCounter--

			if (pCounter < 0) {// Close comes before Open
				throw new Error('Invalid conditions build, closing parenthesis must occur after Opening one')
			}
		}

		if (pCounter > 0) // Opening more than closing
			throw new Error('Invalid conditions build, opening parentheses are more than closing ones')

		if (pCounter < 0) // Closing more than opening
			throw new Error('Invalid conditions build, closing parentheses are more than opening ones')
	}
}

