import { Mongo } from 'meteor/mongo'
import { Collections, SupportingEvidenceType } from './helpers/enums'

export interface SupportingEvidenceBase {
	_id: string
	type: SupportingEvidenceType
	description?: string
}

export interface SupportingEvidenceVideo extends SupportingEvidenceBase {
	type: SupportingEvidenceType.VIDEO
	/** Max length in ms */
	maxLength?: number
	/** Min length in ms */
	minLength?: number
	/** Path to / name of file uploaded by user */
	file?: string
}

export interface SupportingEvidenceText extends SupportingEvidenceBase {
	type: SupportingEvidenceType.TEXT
	/** Max length in words */
	maxLength?: number
	/** Min length in words */
	minLength?: number
	/** Text submitted by user */
	text?: string
}

export interface SupportingEvidencePDF extends SupportingEvidenceBase {
	type: SupportingEvidenceType.PDF
	/** e.g. 5 pages - not automatically checked */
	minLength?: string
	/** e.g. 30 pages - not automatically checked */
	maxLength?: string
	/** Path to / name of file uploaded by user */
	file?: string
}

export interface SupportingEvidenceCall extends SupportingEvidenceBase {
	type: SupportingEvidenceType.CALL
	date?: number
	called?: boolean
}

export type SupportingEvidence =
	| SupportingEvidenceVideo
	| SupportingEvidenceText
	| SupportingEvidencePDF
	| SupportingEvidenceCall

export const SupportingEvidence = new Mongo.Collection<SupportingEvidence>(Collections.SUPPORTING_EVIDENCE)
