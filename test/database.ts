// database schema
import {
  Database,
  Schema,
  Table,
  BooleanColumn,
  NumberColumn,
  TextColumn,
} from '../src'

export const database = new Database({
  version: 1,
  schemas: {
    public: new Schema({
      name: 'public',
      tables: {
        testTable: new Table({
          name: 'testTable',
          columns: {
            col1: new TextColumn({ name: 'col1' }),
            col2: new TextColumn({ name: 'col2' }),
            col3: new TextColumn({ name: 'col3' }),
            col4: new NumberColumn({ name: 'col4' }),
            col5: new NumberColumn({ name: 'col5' }),
            col6: new NumberColumn({ name: 'col6' }),
            col7: new BooleanColumn({ name: 'col7' }),
            col8: new BooleanColumn({ name: 'col8' }),
          },
        }),
        table2: new Table({
          name: 'table2',
          columns: {
            col1: new TextColumn({ name: 'col1' }),
          },
        }),
      },
    }),
    schema1: new Schema({
      name: 'schema1',
      tables: {
        table1: new Table({
          name: 'table1',
          columns: {
            col1: new TextColumn({ name: 'col1' }),
          },
        }),
      },
    }),
  },
})
