import { escapeDoubleQuote } from './util'
import { BuilderData } from './builder'
import { IStatementGiver } from './models/IStatementGiver'
import { Table } from './database'

export enum FromItemRelation {
  NO_RELATION = '',
  COMMA = ', ',
  // TODO: to be implemented
  // JOIN,
  // LEFT_JOIN,
  // RIGHT_JOIN,
  // INNER_JOIN,
  // FULL_JOIN,
  CROSS_JOIN = ' CROSS JOIN ',
}
export class FromItemInfo implements IStatementGiver{
  constructor(
    public readonly fromItem: Table,
    public readonly relation: FromItemRelation = FromItemRelation.COMMA,
    public readonly alias?: string,
  ) {}

  public get table(): Table {
    return this.fromItem
  }

  public getStmt(data: BuilderData): string {
    if (this.alias !== undefined) {
      // escape double quote by repeating it
      const escapedAlias = escapeDoubleQuote(this.alias)
      const asString = (data.option?.addAsBeforeTableAlias === 'always')
        ? ' AS' : ''
      return `${this.relation}${this.fromItem.getStmt(data)}${asString} "${escapedAlias}"`
    }
    return `${this.relation}${this.fromItem.getStmt(data)}`
  }

}
