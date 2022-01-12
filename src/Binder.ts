export class Binder {
  private static instance: Binder
  private values: any[] = []

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {
  }

  public static getInstance(): Binder {
    if (!Binder.instance) {
      Binder.instance = new Binder()
    }
    return Binder.instance
  }

  public add(value: any): BinderNo {
    this.values.push(value)
    return new BinderNo(this.values.length)
  }

  public getValues(): any[] {
    const result = [...this.values]
    this.values.length = 0
    return result
  }
}

export class BinderNo {
  public constructor(public readonly no: number) {}
}
