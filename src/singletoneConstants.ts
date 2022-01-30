export class Asterisk {
  private static instance: Asterisk

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): Asterisk {
    if (!Asterisk.instance) {
      Asterisk.instance = new Asterisk()
    }
    return Asterisk.instance
  }

  public toString(): string {
    return '*'
  }
}
export const ASTERISK = Asterisk.getInstance()

class Distinct {
  private static instance: Distinct

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): Distinct {
    if (!Distinct.instance) {
      Distinct.instance = new Distinct()
    }
    return Distinct.instance
  }

  public toString(): string {
    return 'DISTINCT'
  }
}
export const DISTINCT = Distinct.getInstance()

class All {
  private static instance: All

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): All {
    if (!All.instance) {
      All.instance = new All()
    }
    return All.instance
  }

  public toString(): string {
    return 'ALL'
  }
}
export const ALL = All.getInstance()
