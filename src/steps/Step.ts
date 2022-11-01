import { Expression } from '../models'
import { Column } from '../database'
import { Asterisk } from '../singletoneConstants'
import { AggregateFunction } from '../AggregateFunction'
import { Binder } from '../binder'
import { TableAsterisk } from '../TableAsterisk'

export type ColumnLike = Column|Expression
export type SelectItem = ColumnLike|AggregateFunction|Binder|Asterisk|TableAsterisk
