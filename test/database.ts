// database schema
import { BooleanColumn, Database, NumberColumn, Schema, Table, TextColumn } from '../src'

export const column1 = new TextColumn({ name: 'col1' })
export const column2 = new TextColumn({ name: 'col2' })
export const column3 = new TextColumn({ name: 'col3' })
export const column4 = new NumberColumn({ name: 'col4' })
export const column5 = new NumberColumn({ name: 'col5' })
export const column6 = new NumberColumn({ name: 'col6' })
export const column7 = new BooleanColumn({ name: 'col7' })
export const column8 = new BooleanColumn({ name: 'col8' })
export const table = new Table({
  name: 'testTable',
  columns: [column1, column2, column3, column4, column5, column6, column7, column8],
})
export const schema = new Schema({ name: 'public', tables: [table] })
export const database = new Database({ version: 1, schemas: [schema] })
