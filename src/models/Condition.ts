import { Expression, ExpressionType } from './Expression'
import { ComparisonOperator, NullOperator, Operator, Qualifier } from '../operators'
import { BuilderData } from '../builder'
import { SelectItemInfo } from '../SelectItemInfo'
import { Column } from '../columns'
import { Operand } from './Operand'
import { IStatementGiver } from './IStatementGiver'
import { Binder } from '../binder'

export class Condition implements Expression, IStatementGiver {
  public readonly leftExpression: Expression
  public readonly operator?: Qualifier
  public readonly rightExpression?: Expression

  // Implement Expression
  public readonly leftOperand: Operand
  public readonly rightOperand?: Operand
  public readonly type: ExpressionType.NULL|ExpressionType.BOOLEAN

  constructor(leftExpression: Expression)
  constructor(leftExpression: Expression, operator: Qualifier, rightExpression: Expression)
  constructor(leftExpression: Expression, operator: Qualifier, rightExpression: Expression, notLeft: boolean, notRight: boolean)
  constructor(leftExpression: Expression, operator?: Qualifier, rightExpression?: Expression, notLeft?: boolean, notRight?: boolean) {
    this.leftOperand = new Operand(leftExpression, notLeft)
    this.operator = operator
    this.rightOperand = new Operand(rightExpression, notRight)
    this.type = Condition.getResultExpressionType(leftExpression, operator, rightExpression)
    this.leftExpression = leftExpression
    this.rightExpression = rightExpression
  }

  public getStmt(data: BuilderData): string {
    if (this.operator !== undefined && this.rightOperand !== undefined)
      return `${this.leftOperand.getStmt(data)} ${this.operator} ${this.rightOperand.getStmt(data)}`
    else
      return this.leftOperand.getStmt(data)
  }

  // Implement Expression, We don't really need it
  public as(alias: string): SelectItemInfo {
    return new SelectItemInfo(this, alias)
  }

  // Implement Expression, We don't really need it
  public eq(value: null|number): Condition {
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    return new Condition(this, qualifier, new Expression(value))
  }

  // Implement Expression, We don't really need it
  public eq$(value: null|number): Condition {
    const binder = new Binder(value)
    const qualifier = value === null ? NullOperator.Is : ComparisonOperator.Equal
    return new Condition(this, qualifier, new Expression(binder))
  }

  // Implement Expression, but still good to keep it
  public getColumns(): Column[] {
    const columns: Column[] = []
    columns.push(...this.leftExpression.getColumns())
    if (this.rightExpression !== undefined)
      columns.push(...this.rightExpression.getColumns())

    return columns
  }

  private static getResultExpressionType(leftExpression: Expression, operator?: Qualifier, rightExpression?: Expression)
    : ExpressionType.NULL|ExpressionType.BOOLEAN {
    if (operator === undefined || rightExpression === undefined) {
      if (leftExpression.type === ExpressionType.NULL || leftExpression.type === ExpressionType.BOOLEAN) {
        return leftExpression.type
      }
      throw new Error(`Condition can not created based on expression type: ${leftExpression.type}`)
    }

    if (leftExpression.type === rightExpression.type) {
      return ExpressionType.BOOLEAN
    }

    if (Condition.isNullOperator(operator)) {
      if (rightExpression.type === ExpressionType.NULL) {
        return ExpressionType.BOOLEAN
      } else if (leftExpression.type === ExpressionType.NULL && rightExpression.type === ExpressionType.BOOLEAN) {
        return ExpressionType.BOOLEAN
      } else if (leftExpression.type === ExpressionType.BOOLEAN || rightExpression.type === ExpressionType.BOOLEAN) {
        throw new Error('Boolean type only used with Boolean or Null')
      } else if (leftExpression.type === ExpressionType.NULL) {
        throw new Error('Null operator can only be used when null on the right side')
      }
      throw new Error('Null operator can only be used with null and boolean')
    } else if (Condition.isComparisonOperator(operator)) {
      if (leftExpression.type === ExpressionType.NULL || rightExpression.type === ExpressionType.NULL) {
        return ExpressionType.NULL
      }
      throw new Error(`Comparison operator doesn't work with different types`)
    }
    throw new Error(`Operator is not supported: ${operator}`)
  }

  private static isComparisonOperator(operator: Operator): boolean {
    return Object.values(ComparisonOperator).includes(operator as ComparisonOperator)
  }

  private static isNullOperator(operator: Operator): boolean {
    return Object.values(NullOperator).includes(operator as NullOperator)
  }
}

