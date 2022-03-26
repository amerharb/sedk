import { PrimitiveType } from './steps/steps'

export class BinderStore {
  private store: Binder[] = []

  public add(binder: Binder): void {
    if (binder.no !== undefined) {
      throw new Error('This binder already stored')
    }

    binder.no = this.store.length + 1
    this.store.push(binder)
  }

  public getValues(): PrimitiveType[] {
    return this.store.map(it => it.value)
  }

  public cleanUp() {
    this.store.length = 0
  }
}

export class Binder {
  private mNo?: number = undefined

  public constructor(
    public readonly value: PrimitiveType,
  ) {}

  public set no(no: number|undefined) {
    if (this.mNo !== undefined) {
      throw new Error('This Binder already has a number')
    }
    this.mNo = no
  }

  public get no(): number|undefined {
    return this.mNo
  }

  public toString(): string {
    return this.getStmt()
  }

  public getStmt(): string {
    return `$${this.no}`
  }
}
