import { ItemInterface } from 'react-sortablejs'
import { Entry } from '../entries'
import { Evidence } from '../evidence'

export interface EntryListEvidence {
	stationId: string
	stationName: string
	evidence: Evidence[]
	comments?: string
	entry: Entry
}

export interface EntriesList extends ItemInterface {
	entry: EntryListEvidence
}
