export enum ArithmeticOperator {
  ADD = '+',
  SUB = '-',
  MUL = '*',
  DIV = '/',
  MOD = '%',
  EXP = '^',
}

export enum TextOperator {
  CONCAT = '||',
}

export enum ComparisonOperator {
  Equal = '=',
  NotEqual = '<>',
  GreaterThan = '>',
  GreaterOrEqual = '>=',
  LesserThan = '<',
  LesserOrEqual = '<=',
}

export enum NullOperator {
  Is = 'IS',
  IsNot = 'IS NOT',
}

export type Qualifier = NullOperator|ComparisonOperator
export type Operator = NullOperator|ComparisonOperator|ArithmeticOperator|TextOperator
