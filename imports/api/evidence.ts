import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { UserHasRole } from './accounts'
import { Collections, Roles, SupportingEvidenceType } from './helpers/enums'

export interface EvidenceBase {
	type: SupportingEvidenceType
	_id?: string
	/** The category supporting evidence this belongs to */
	supportingEvidenceId: string
	stationId: string
	awardId: string // TODO: Rename to categoryId
	/** Could be text, url */
	content: string
	/** Whether the evidence has been verified */
	verified: boolean
}

export interface EvidenceVideo extends EvidenceBase {
	type: SupportingEvidenceType.VIDEO
	sharingLink: string
	shortClipSharingLink: string
}

export interface EvidencePDF extends EvidenceBase {
	type: SupportingEvidenceType.PDF
	sharingLink: string
}

export interface EvidenceText extends EvidenceBase {
	type: SupportingEvidenceType.TEXT
}

export interface EvidenceCall extends EvidenceBase {
	type: SupportingEvidenceType.CALL
}

export type Evidence = EvidenceVideo | EvidencePDF | EvidenceText | EvidenceCall

export const EvidenceCollection = new Mongo.Collection<Evidence>(Collections.EVIDENCE)

if (Meteor.isServer) {
	Meteor.publish(Collections.EVIDENCE, () => {
		if (Meteor.userId() && UserHasRole([Roles.ADMIN, Roles.HOST, Roles.JUDGE])) {
			return EvidenceCollection.find({ })
		}
	})
}

export async function InsertEvidence (evidence: Evidence): Promise<string> {
	return new Promise((resolve, reject) => {
		EvidenceCollection.insert(evidence, (error: any, id: string) => {
			if (error) reject(error)
			// TODO: Multiple entries
			// TODO: Entry IDs are null
			resolve(id)
		})
	})
}
