import { Mongo } from 'meteor/mongo'
import { Collections } from './helpers/enums'

export interface Evidence {
	_id?: string
	/** The category supporting evidence this belongs to */
	supportingEvidenceId: string
	stationId: string
	awardId: string
	/** Could be text, url */
	content: string
	/** Whether the evidence has been verified */
	verified: boolean
}

export const Evidence = new Mongo.Collection<Evidence>(Collections.EVIDENCE)

export async function InsertEvidence (evidence: Evidence): Promise<string> {
	return new Promise((resolve, reject) => {
		Evidence.insert(evidence, (error: any, id: string) => {
			if (error) reject(error)
			// TODO: Multiple entries
			// TODO: Entry IDs are null
			resolve(id)
		})
	})
}
