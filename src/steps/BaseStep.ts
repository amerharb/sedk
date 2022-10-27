import { BuilderData, SqlPath } from '../builder'
import { Condition, Expression, PrimitiveType } from '../models'
import { LogicalOperator } from '../operators'
import { DeleteWithoutConditionError, TableNotFoundError } from '../errors'
import { AliasedTable, BooleanColumn, Table } from '../database'
import { FromItemInfo, FromItemRelation } from '../FromItemInfo'

export enum Parenthesis {
	Open = '(',
	Close = ')',
}

export abstract class BaseStep {
	constructor(
		protected readonly data: BuilderData,
		protected readonly prevStep: BaseStep|null,
	) {}

	public getSQL(): string {
		let result = this.getFullStatement()
		if (this.data.option.useSemicolonAtTheEnd) result += ';'
		return result
	}

	protected getFullStatement(): string {
		let result = ''
		if (this.prevStep !== null) {
			const stmt = this.prevStep.getFullStatement().trimRight()
			if (stmt !== '') {
				result += `${stmt} `
			}
		}
		result += this.getStepStatement()
		return result
	}

	public abstract getStepStatement(): string

	public getBindValues(): PrimitiveType[] {
		return [...this.data.binderStore.getValues()]
	}

	// TODO: remove this and it sub functions later, when all logic moved to steps
	private getStatement(): string {
		let result: string
		switch (this.data.sqlPath) {
		case SqlPath.SELECT:
			result = this.getSelectStatement()
			break
		case SqlPath.DELETE:
			result = this.getDeleteStatement()
			break
		case SqlPath.INSERT:
			result = this.getInsertStatement()
			break
		case SqlPath.UPDATE:
			result = this.getUpdateStatement()
			break
			// TODO: change this later to throw error
		default:
			result = this.getSelectStatement()
		}

		if (this.data.option.useSemicolonAtTheEnd) result += ';'

		return result
	}

	private getSelectStatement(): string {
		let result = `SELECT`

		if (this.data.selectItemInfos.length > 0) {
			const selectPartsString = this.data.selectItemInfos.map(it => {
				return it.getStmt(this.data)
			})
			result += ` ${selectPartsString.join(', ')}`
		}

		if (this.data.fromItemInfos.length > 0) {
			result += ` FROM ${this.data.fromItemInfos.map(it => it.getStmt(this.data)).join('')}`
		}

		result += this.getWhereParts()

		if (this.data.groupByItems.length > 0) {
			result += ` GROUP BY ${this.data.groupByItems.map(it => it.getStmt(this.data)).join(', ')}`
		}

		if (this.data.havingParts.length > 0) {
			BaseStep.throwIfConditionPartsInvalid(this.data.havingParts)
			const havingPartsString = this.data.havingParts.map(it => {
				if (it instanceof Condition || it instanceof Expression || it instanceof BooleanColumn) {
					return it.getStmt(this.data)
				}
				return it.toString()
			})
			result += ` HAVING ${havingPartsString.join(' ')}`
		}

		if (this.data.orderByItemInfos.length > 0) {
			const orderByPartsString = this.data.orderByItemInfos.map(it => {
				return it.getStmt(this.data)
			})
			result += ` ORDER BY ${orderByPartsString.join(', ')}`
		}

		return result
	}

	private getDeleteStatement(): string {
		let result = `DELETE`

		if (this.data.fromItemInfos.length > 0) {
			// todo: throw if fromItemInfos.length > 1
			result += ` FROM ${this.data.fromItemInfos[0].getStmt(this.data)}`
		}

		result += this.getWhereParts()

		return result
	}

	private getInsertStatement(): string {
		// let result = 'INSERT'
		// if (this.data.insertIntoTable !== undefined) {
		// 	result += ` INTO ${this.data.insertIntoTable.getStmt(this.data)}`
		// 	if (this.data.insertIntoColumns.length > 0) {
		// 		result += `(${this.data.insertIntoColumns.map(it => it.getDoubleQuotedName()).join(', ')})`
		// 	}
		// 	if (this.data.insertIntoValues.length > 0) {
		// 		const valueStringArray = this.data.insertIntoValues.map(it => {
		// 			if (it === null) {
		// 				return getStmtNull()
		// 			} else if (typeof it === 'boolean') {
		// 				return getStmtBoolean(it)
		// 			} else if (isNumber(it)) {
		// 				return it.toString()
		// 			} else if (typeof it === 'string') {
		// 				return getStmtString(it)
		// 			} else if (it instanceof Date) {
		// 				return getStmtDate(it)
		// 			} else if (it instanceof Binder) {
		// 				if (it.no === undefined) {
		// 					this.data.binderStore.add(it)
		// 				}
		// 				return it.getStmt()
		// 			} else if (it instanceof Default) {
		// 				return it.getStmt()
		// 			} else {
		// 				throw new Error(`Value step has Unsupported value: ${it}, type: ${typeof it}`)
		// 			}
		// 		})
		// 		result += ` VALUES(${valueStringArray.join(', ')})`
		// 	} else if (this.data.insertIntoDefaultValues) {
		// 		result += ' DEFAULT VALUES'
		// 	} else if (this.data.selectItemInfos.length > 0) {
		// 		result += ` ${this.getSelectStatement()}`
		// 	} else {
		// 		throw new Error('Insert statement must have values or select items')
		// 	}
		// }

		// return result
		throw new Error('To be deleted')
	}

	private getUpdateStatement(): string {
		throw new Error('To be deleted')
		// let result = 'UPDATE'
		// if (this.data.updateTable !== undefined) {
		// 	result += ` ${this.data.updateTable.getStmt(this.data)}`
		// 	if (this.data.updateSetItemInfos.length > 0) {
		// 		result += ` SET ${this.data.updateSetItemInfos.map(it => it.getStmt(this.data)).join(', ')}`
		// 	}
		// 	result += this.getWhereParts()
		// }
		// return result
	}

	private getWhereParts(): string {
		// TODO: this function to be remove later
		// if (this.data.whereParts.length > 0) {
		// 	BaseStep.throwIfConditionPartsInvalid(this.data.whereParts)
		// 	const wherePartsString = this.data.whereParts.map(it => {
		// 		if (it instanceof Condition || it instanceof Expression || it instanceof BooleanColumn) {
		// 			return it.getStmt(this.data)
		// 		}
		// 		return it.toString()
		// 	})
		// 	return ` WHERE ${wherePartsString.join(' ')}`
		// }

		if (this.data.sqlPath === SqlPath.DELETE && this.data.option.throwErrorIfDeleteHasNoCondition) {
			throw new DeleteWithoutConditionError(`Delete statement must have where conditions or set throwErrorIfDeleteHasNoCondition option to false`)
		}

		return ''
	}

	public cleanUp() {
		this.data.sqlPath = undefined
		this.data.selectItemInfos.length = 0
		this.data.fromItemInfos.length = 0
		this.data.groupByItems.length = 0
		this.data.havingParts.length = 0
		this.data.orderByItemInfos.length = 0
		this.data.binderStore.cleanUp()
	}

	protected addHavingParts(cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition) {
		BaseStep.addConditionParts(this.data.havingParts, cond1, op1, cond2, op2, cond3)
	}

	protected static getTable(tableOrAliasedTable: Table|AliasedTable): Table {
		if (tableOrAliasedTable instanceof Table)
			return tableOrAliasedTable
		else
			return tableOrAliasedTable.table
	}

	protected throwIfTableNotInDb(table: Table) {
		if (!this.data.database.hasTable(table))
			throw new TableNotFoundError(`Table: "${table.name}" not found`)
	}

	protected addFromItemInfo(table: Table|AliasedTable, relation: FromItemRelation) {
		this.throwIfTableNotInDb(BaseStep.getTable(table))
		this.data.fromItemInfos.push(new FromItemInfo(
			BaseStep.getTable(table),
			relation,
			table instanceof AliasedTable ? table.alias : undefined,
		))
	}

	protected static addConditionParts(conditionArray: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[],
		cond1: Condition, op1?: LogicalOperator, cond2?: Condition, op2?: LogicalOperator, cond3?: Condition) {
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

