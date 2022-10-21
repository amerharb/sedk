import { isNumber } from 'Non-Exported/util'
import { ExpressionType } from './models/Expression'
import { PrimitiveType } from './models/types'
import { IStatementGiver } from './models/IStatementGiver'

export class BinderStore {
	private store: Binder[] = []

	public add(binder: Binder): void {
		if (binder.no !== undefined) {
			throw new Error('This binder already stored')
		}

		binder.no = this.store.length + 1
		this.store.push(binder)
	}

	public getBinder(value: PrimitiveType): Binder {
		const binder = new Binder(value, this.store.length + 1)
		this.store.push(binder)
		return binder
	}

	public getValues(): PrimitiveType[] {
		return this.store.map(it => it.value)
	}

	public cleanUp() {
		this.store.length = 0
	}
}

export class Binder implements IStatementGiver {
	private mNo?: number = undefined
	public readonly type: ExpressionType

	public constructor(value: PrimitiveType)
	public constructor(value: PrimitiveType, no: number)
	public constructor(
		public readonly value: PrimitiveType,
		no?: number,
	) {
		this.mNo = no
		this.type = Binder.getType(value)
	}

	public set no(no: number|undefined) {
		if (this.mNo !== undefined) {
			throw new Error('This Binder already has a number')
		}
		this.mNo = no
	}

	public get no(): number|undefined {
		return this.mNo
	}

	public toString(): string {
		return this.getStmt()
	}

	public getStmt(): string {
		if (this.mNo === undefined) {
			throw new Error(`You can't getStmt() from this binder, The binder is not stored and has undefined "No"`)
		}
		return `$${this.mNo}`
	}

	private static getType(value: PrimitiveType): ExpressionType {
		if (value === null) {
			return ExpressionType.NULL
		} else if (typeof value === 'boolean') {
			return ExpressionType.BOOLEAN
		} else if (isNumber(value)) {
			return ExpressionType.NUMBER
		} else if (typeof value === 'string') {
			return ExpressionType.TEXT
		} else if (value instanceof Date) {
			return ExpressionType.DATE
		}
		throw new Error(`Unknown type of value: ${value}`)
	}
}

export class BinderArray implements IStatementGiver {
	public type: ExpressionType

	public constructor(public readonly binders: Binder[]) {
		BinderArray.throwIfBindersIsInvalid(binders)
		this.type = binders[0].type
	}

	public getStmt(): string {
		return `(${this.binders.map(it => it.getStmt()).join(', ')})`
	}

	private static throwIfBindersIsInvalid(binders: Binder[]) {
		if (binders.length === 0) {
			throw new Error('BinderArray must have at least one element')
		}
		const type = binders[0].type
		binders.forEach(it => {
			if (it.type !== type) {
				throw new Error('All binders in BinderArray must be same type')
			}
		})
	}
}
