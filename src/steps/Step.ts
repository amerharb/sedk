import { Expression } from '../models'
import { AliasedTable, Column, Table } from '../database'
import { Asterisk } from '../singletoneConstants'
import { AggregateFunction } from '../AggregateFunction'
import { Binder } from '../binder'
import { TableAsterisk } from '../TableAsterisk'

export type ColumnLike = Column|Expression
export type SelectItem = ColumnLike|AggregateFunction|Binder|Asterisk|TableAsterisk
export type FromItem = Table|AliasedTable
export type FromItems = [FromItem, ...FromItem[]]
