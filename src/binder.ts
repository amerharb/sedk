export class BinderStore {
  private static instance: BinderStore
  private store: Binder[] = []

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): BinderStore {
    if (!BinderStore.instance) {
      BinderStore.instance = new BinderStore()
    }
    return BinderStore.instance
  }

  public add(value: PrimitiveType): Binder {
    const binder = new Binder(this.store.length + 1, value)
    this.store.push(binder)
    return binder
  }

  public getValues(): PrimitiveType[] {
    const result = this.store.map(it => it.value)
    this.store.length = 0
    return result
  }
}

export class Binder {
  public constructor(public readonly no: number, public readonly value: PrimitiveType) {}
}

export type PrimitiveType = null|boolean|number|string
