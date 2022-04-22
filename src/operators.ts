export enum ArithmeticOperator {
  ADD = '+',
  SUB = '-',
  MUL = '*',
  DIV = '/',
  MOD = '%',
  EXP = '^',
}

export enum BitwiseOperator {
  BitwiseOr = '|',
  BitwiseAnd = '&',
  BitwiseXor = '#',
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

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

export type Qualifier = NullOperator|ComparisonOperator
export type Operator = Qualifier|ArithmeticOperator|BitwiseOperator|TextOperator
