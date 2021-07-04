import { ItemInterface } from 'react-sortablejs'
import { Category } from '../categories'
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
	entryId: string
	score?: Score
}
