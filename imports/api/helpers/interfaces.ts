import { ItemInterface } from 'react-sortablejs'
import { Category } from '../categories'
import { Entry } from '../entries'
import { Evidence } from '../evidence'
import { Result } from '../results'
import { Score } from '../scores'

export interface CategoryWithEntries {
	category: Category
	entries: EntryListEvidence[]
	result?: Result
}

export interface EntryListEvidence extends ItemInterface {
	stationId: string
	stationName: string
	evidence: Evidence[]
	comments?: string
	score?: Score
	entry: Entry
}
