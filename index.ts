'use strict'
import * as sql from './src/aSql'

const c1 = new sql.Column('col1',)
const c2 = new sql.Column('col2',)
const c3 = new sql.Column('col3',)
const t = new sql.Table('testTable', [c1, c2, c3])

const asql = new sql.ASql([t])

//const AND = Operator.AND
const OR = sql.Operator.OR

const x = asql
  .select(c1, c2)
  .from(t)
  .where(c1.isEqual('v1'), OR, c2.isEqual('v22'))
  .or(c2.isEqual('v2'))
  .and(c3.isEqual('v3'))
  .getSQL()

console.log(x)
