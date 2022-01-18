// TODO: add other arithmetic operators
export enum ArithmeticOperator {
  ADD = '+',
  SUB = '-',
}

export enum TextOperator {
  CONCAT = '||',
}

// TODO: add other comparison operators
export enum ComparisonOperator {
  Equal = '=',
  GreaterThan = '>',
}

export enum NullOperator {
  Is = 'IS',
}

export type Qualifier = NullOperator|ComparisonOperator
export type Operator = NullOperator|ComparisonOperator|ArithmeticOperator|TextOperator
