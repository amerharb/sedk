import { IStatementGiver } from './IStatementGiver'

export class Asterisk implements IStatementGiver {
	private static instance: Asterisk
	private readonly unique: symbol = Symbol()

	private constructor() {}

	public static getInstance(): Asterisk {
		if (!Asterisk.instance) {
			Asterisk.instance = new Asterisk()
		}
		return Asterisk.instance
	}

	public getStmt(): string {
		return '*'
	}
}

export const ASTERISK = Asterisk.getInstance()
