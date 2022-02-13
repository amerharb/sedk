import { BuilderOption } from './option'
import { OrderByItem } from './steps'

export class OrderByItemInfo {
  public set builderOption(option: BuilderOption) {
    this.option = option
  }

  constructor(
    private readonly orderByItem: OrderByItem,
    private readonly direction: OrderByDirection = OrderByDirection.NOT_EXIST,
    private readonly nullPosition: OrderByNullsPosition = OrderByNullsPosition.NOT_EXIST,
    private option?: BuilderOption,
  ) {}

  public toString(): string {
    const direction = this.getDirectionFromOption()
    const nullPosition = this.getNullLastFromOption()
    return `${this.orderByItem}${direction}${nullPosition}`
  }

  private getDirectionFromOption(): OrderByDirection {
    if (this.direction === OrderByDirection.DESC)
      return OrderByDirection.DESC

    if (this.option !== undefined) {
      switch (this.option.addAscAfterOrderByItem) {
      case 'always':
        return OrderByDirection.ASC
      case 'never':
        return OrderByDirection.NOT_EXIST
      }
    }
    return this.direction
  }

  private getNullLastFromOption(): OrderByNullsPosition {
    if (this.nullPosition === OrderByNullsPosition.NULLS_FIRST)
      return OrderByNullsPosition.NULLS_FIRST

    if (this.option !== undefined) {
      switch (this.option.addNullsLastAfterOrderByItem) {
      case 'always':
        return OrderByNullsPosition.NULLS_LAST
      case 'never':
        return OrderByNullsPosition.NOT_EXIST
      }
    }
    return this.nullPosition
  }
}

export enum OrderByDirection {
  NOT_EXIST = '',
  ASC = ' ASC', /** default in postgres */
  DESC = ' DESC',
}

export enum OrderByNullsPosition {
  NOT_EXIST = '',
  NULLS_FIRST = ' NULLS FIRST',
  NULLS_LAST = ' NULLS LAST', /** default in postgres */
}
