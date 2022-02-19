import { Database, Schema, Table, c } from '../src'

const n = {
  version: 1,
  'public': {
    Employee: {
      name: {
        type: 'Text',
        toString: () => 'name',
      },
      toString: () => 'Employee',
    },
    toString: () => 'public',
  },
}

const db = new Database({
  version: 5,
  schemas: [
    new Schema({
      schemaName: 'public',
      tables: [
        new Table({
          tableName: 'Employee',
          columns: [
            c({ columnName: 'id', type: 'Number' }),
            c({ columnName: n.public.Employee.name.toString(), type: n.public.Employee.name.type }),
            c({ columnName: 'age', type: 'Number' }),
            c({ columnName: 'isManager', type: 'Boolean' }),
          ],
        }),
        new Table({
          tableName: 'Salary',
          columns: [
            c({ columnName: 'id', type: 'Number' }),
            c({ columnName: 'employee', type: 'Number' }),
            c({ columnName: 'date', type: 'Text' }),
            c({ columnName: 'amount', type: 'Number' }),
          ],
        }),
      ],
    })],
})
