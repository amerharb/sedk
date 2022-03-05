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
            column1: new TextColumn({ name: 'col1' }),
            column2: new TextColumn({ name: 'col2' }),
            column3: new TextColumn({ name: 'col3' }),
            column4: new NumberColumn({ name: 'col4' }),
            column5: new NumberColumn({ name: 'col5' }),
            column6: new NumberColumn({ name: 'col6' }),
            column7: new BooleanColumn({ name: 'col7' }),
            column8: new BooleanColumn({ name: 'col8' }),
          },
        }),
      },
    }),
  },
})
