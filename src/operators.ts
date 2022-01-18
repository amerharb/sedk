// TODO: add other arithmetic operators
export enum ArithmeticOperator {
  ADD = '+',
  SUB = '-',
}

export enum TextOperator {
  CONCAT = '||',
}

// TODO: add other comparison operators
export enum BooleanOperator {
  Equal = '=',
  GreaterThan = '>',
}

export enum NullOperator {
  Is = 'IS',
}

export type Qualifier = NullOperator|BooleanOperator
export type Operator = NullOperator|BooleanOperator|ArithmeticOperator|TextOperator
