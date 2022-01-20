import { BinderStore } from './binder'
import {
  Condition,
  Expression,
  Operand,
  ExpressionType,
} from './models'
import {
  NullOperator,
  ComparisonOperator,
  TextOperator,
  Operator,
} from './operators'
import {
  BooleanLike,
  NumberLike,
  TextLike,
} from './models'

export class Database {
  private readonly version?: number
  private readonly tables: Table[]

  constructor(tables: Table[], version?: number) {
    this.tables = tables
    this.version = version
  }

  public getVersion(): number|undefined {
    return this.version
  }

  public getTables(): Table[] {
    return this.tables
  }

  public isTableExist(table: Table): boolean {
    let found = false
    for (const t of this.tables) {
      if (table === t) {
        found = true
        break
      }
    }
    return found
  }
}

export class Table {
  private readonly tableName: string
  private readonly columns: Column[]

  constructor(tableName: string, columns: Column[]) {
    this.tableName = tableName
    this.columns = columns
  }

  public getColumn() {
    return this.columns
  }

  public toString() {
    return this.tableName
  }
}

export abstract class Column {
  protected readonly columnName: string
  protected readonly binderStore = BinderStore.getInstance()

  protected constructor(columnName: string) {
    this.columnName = columnName
  }

  public toString() {
    return this.columnName
  }
}

export class BooleanColumn extends Column implements Condition {
  // implement Condition
  public readonly leftExpression: Expression = new Expression(this)
  public readonly leftOperand: Operand = this.leftExpression.leftOperand
  public readonly type: ExpressionType = ExpressionType.BOOLEAN

  constructor(columnName: string) {
    super(columnName)
  }

  public eq(value: null|BooleanLike): Condition {
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }

  public eq$(value: null|boolean): Condition {
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public ne(value: null|BooleanLike): Condition {
    const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }

  public ne$(value: null|boolean): Condition {
    const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public not(): Condition {
    return new Condition(new Expression(this, true))
  }
}

export class NumberColumn extends Column {
  constructor(columnName: string) {
    super(columnName)
  }

  public eq(value: null|NumberLike): Condition
  public eq(value1: NumberLike, op: Operator, value2: NumberLike): Condition
  public eq(value1: null|NumberLike, op?: Operator, value2?: NumberLike): Condition {
    if (op === undefined && value2 === undefined) {
      const qualifier = value1 === null ? NullOperator.Is : ComparisonOperator.Equal
      return new Condition(new Expression(this), qualifier, new Expression(value1))
    } else if (op !== undefined && value2 !== undefined) {
      return new Condition(new Expression(this), ComparisonOperator.Equal, new Expression(value1, op, value2))
    }
    throw new Error('not supported case')
  }

  public eq$(value: null|number): Condition {
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public ne(value: null|NumberLike): Condition
  public ne(value1: NumberLike, op: Operator, value2: NumberLike): Condition
  public ne(value1: null|NumberLike, op?: Operator, value2?: NumberLike): Condition {
    if (op === undefined && value2 === undefined) {
      const qualifier = value1 === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
      return new Condition(new Expression(this), qualifier, new Expression(value1))
    } else if (op !== undefined && value2 !== undefined) {
      return new Condition(new Expression(this), ComparisonOperator.NotEqual, new Expression(value1, op, value2))
    }
    throw new Error('not supported case')
  }

  public ne$(value: null|number): Condition {
    const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public gt(value: NumberLike): Condition {
    return new Condition(new Expression(this), ComparisonOperator.GreaterThan, new Expression(value))
  }

  public gt$(value: number): Condition {
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), ComparisonOperator.GreaterThan, new Expression(binder))
  }

  public ge(value: NumberLike): Condition {
    return new Condition(new Expression(this), ComparisonOperator.GreaterOrEqual, new Expression(value))
  }

  public ge$(value: number): Condition {
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), ComparisonOperator.GreaterOrEqual, new Expression(binder))
  }

  public lt(value: NumberLike): Condition {
    return new Condition(new Expression(this), ComparisonOperator.LesserThan, new Expression(value))
  }

  public lt$(value: number): Condition {
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), ComparisonOperator.LesserThan, new Expression(binder))
  }

  public le(value: NumberLike): Condition {
    return new Condition(new Expression(this), ComparisonOperator.LesserOrEqual, new Expression(value))
  }

  public le$(value: number): Condition {
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), ComparisonOperator.LesserOrEqual, new Expression(binder))
  }
}

export class TextColumn extends Column {
  constructor(columnName: string) {
    super(columnName)
  }

  public eq(value: Expression): Condition
  public eq(value: null|string|TextColumn): Condition
  public eq(value: null|string|TextColumn|Expression): Condition {
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }

  public eq$(value: null|string): Condition {
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public ne(value: Expression): Condition
  public ne(value: null|string|TextColumn): Condition
  public ne(value: null|string|TextColumn|Expression): Condition {
    const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
    return new Condition(new Expression(this), qualifier, new Expression(value))
  }

  public ne$(value: null|string): Condition {
    const qualifier = value === null ? NullOperator.IsNot : ComparisonOperator.NotEqual
    const binder = this.binderStore.add(value)
    return new Condition(new Expression(this), qualifier, new Expression(binder))
  }

  public concat(value: TextLike): Expression {
    return new Expression(this, TextOperator.CONCAT, value)
  }
}
