import { Expression, ExpressionType } from './Expression'
import { Qualifier } from '../operators'
import { BuilderData } from '../builder'
import { SelectItemInfo } from '../SelectItemInfo'
import { Column } from '../columns'
import { Operand } from './Operand'
import { IStatementGiver } from './IStatementGiver'

export class Condition implements Expression, IStatementGiver {
  public readonly leftExpression: Expression
  public readonly operator?: Qualifier
  public readonly rightExpression?: Expression

  //Implement Expression
  public readonly leftOperand: Operand
  public readonly rightOperand?: Operand
  public readonly type: ExpressionType = ExpressionType.BOOLEAN

  constructor(leftExpression: Expression)
  constructor(leftExpression: Expression, operator: Qualifier, rightExpression: Expression)
  constructor(leftExpression: Expression, operator: Qualifier, rightExpression: Expression, notLeft: boolean, notRight: boolean)
  constructor(leftExpression: Expression, operator?: Qualifier, rightExpression?: Expression, notLeft?: boolean, notRight?: boolean) {
    this.leftOperand = new Operand(leftExpression, notLeft)
    this.operator = operator
    this.rightOperand = new Operand(rightExpression, notRight)
    this.type = ExpressionType.BOOLEAN
    this.leftExpression = leftExpression
    this.rightExpression = rightExpression
  }

  public getStmt(data: BuilderData): string {
    if (this.operator !== undefined && this.rightOperand !== undefined)
      return `${this.leftOperand.getStmt(data)} ${this.operator} ${this.rightOperand.getStmt(data)}`
    else
      return this.leftOperand.getStmt(data)
  }

  public as(alias: string): SelectItemInfo {
    return new SelectItemInfo(this, alias)
  }

  public getColumns(): Column[] {
    const columns: Column[] = []
    columns.push(...this.leftExpression.getColumns())
    if (this.rightExpression !== undefined)
      columns.push(...this.rightExpression.getColumns())

    return columns
  }
}

