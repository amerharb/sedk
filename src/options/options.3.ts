import { BuilderOption as v2 } from './options.2'

export type BuilderOption = {
  $optionVersion: 3
  'use-semicolon-at-the-end'?: 'always'|'when there is more than one statement'
  'add-default-clauses'?: 'always'|'never'|'when mentioned'|{
    'add-ASC-after-order-by-item'?: 'always'|'never'|'when mentioned'
    'add-NULLS-LAST-after-order-by-item'?: 'always'|'never'|'when mentioned'
  }
}

export const defaultBuilderOption: BuilderOption = {
  $optionVersion: 3,
  'use-semicolon-at-the-end': 'always',
  'add-default-clauses': 'when mentioned',
}

export function migrate(option: v2): BuilderOption {
  const addDefaultClauses = (typeof option.addDefaultClauses === 'string')
    ? option.addDefaultClauses
    : {
      'add-ASC-after-order-by-item': option.addDefaultClauses?.addAscAfterOrderByItem,
      'add-NULLS-LAST-after-order-by-item': option.addDefaultClauses?.addNullsLastAfterOrderByItem,
    }
  return {
    $optionVersion: 3,
    'use-semicolon-at-the-end': option.useSemicolonAtTheEnd ? 'always' : 'when there is more than one statement',
    'add-default-clauses': addDefaultClauses,
  }
}

// WiP
// export function getBuilderOptionSimilarity(option: unknown): number {
//   if (option && typeof option === 'object') {
//     if (Object.is(option, {})) return 1
//     if ('use-semicolon-at-the-end' in option) {
//       return 0.5
//     }
//   }
//   return 0
// }
