export class Asterisk {
  private static instance: Asterisk

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

export class Distinct {
  private static instance: Distinct

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

export class All {
  private static instance: All

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
