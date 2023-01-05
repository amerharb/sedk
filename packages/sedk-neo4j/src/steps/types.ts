import { Variable } from '../Variable'
import { Label } from '../Label'
import { Asterisk } from '../singletoneConstants'

export type VarLabels = [(Variable | Label), ...Label[]]
export type ReturnItems = Variable[] | [...Variable[], Asterisk]
