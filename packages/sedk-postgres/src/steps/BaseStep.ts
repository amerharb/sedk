import { BinderStore } from '../binder.ts'
import { FromItem } from './select-path/SelectFromStep.ts'
import { ItemInfo } from '../ItemInfo.ts'
import { ColumnLike } from './select-path/SelectStep.ts'
import { BuilderData } from '../builder.ts'
import { Condition, Expression, PrimitiveType } from '../models/index.ts'
import { LogicalOperator } from '../operators.ts'
import { ColumnNotFoundError, DeleteWithoutConditionError, TableNotFoundError } from '../errors.ts'
import { BooleanColumn, Column, Table } from '../database/index.ts'
import { isDeleteStep, isDeleteWhereStep } from '../util.ts'

export enum Parenthesis {
	Open = '(',
	Close = ')',
}

export type Artifacts = { tables: ReadonlySet<Table>, columns: ReadonlySet<Column> }

export abstract class BaseStep extends Function {
	public readonly rootStep: BaseStep
	protected readonly data: BuilderData
	protected readonly binderStore: BinderStore
	protected readonly prefixSeparator: string = ' '

	constructor(
		public readonly prevStep: BaseStep|null,
	) {
		super()
		this.rootStep = prevStep === null ? this : prevStep.rootStep
		this.data = this.rootStep.data
		this.binderStore = new BinderStore(prevStep?.getBindValues().length ?? 0)
	}

	public getSQL(): string {
		let result = this.getFullStatement({ tables: new Set(), columns: new Set() })
		if (this.data.option.throwErrorIfDeleteHasNoCondition) {
			//look if the path is DELETE and there is no WHERE step
			let foundDELETE = false
			let foundWHERE = false
			let step: BaseStep|null = this
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
		let result: string = ''
		const artifacts = this.mergeArtifacts(this.getFullArtifacts(), nextArtifacts)
		if (this.prevStep !== null) {
			const stmt = this.prevStep.getFullStatement(artifacts).trimRight()
			if (stmt !== '') {
				result += `${stmt}${this.prefixSeparator}`
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

	public abstract getStepArtifacts(): Artifacts

	private getStepStatementCalled = false

	public getBindValues(): PrimitiveType[] {
		// TODO: change the way we fill and call BinderStore
		/** call getStepStmt one time before getBindValues, so binderStore filled with binders */
		if (!this.getStepStatementCalled) {
			this.getStepStatement({ tables: new Set(), columns: new Set() })
			this.getStepStatementCalled = true
		}
		if (this.prevStep !== null) {
			return [...this.prevStep.getBindValues(), ...this.binderStore.getValues()]
		}
		return [...this.binderStore.getValues()]
	}

	/** @deprecated - Not needed since version 0.15.0 */
	public cleanUp(): void {
		// Do nothing
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
				throw new ColumnNotFoundError(item.name)
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

