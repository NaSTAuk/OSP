import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { NaSTAUser, UserHasRole } from './accounts'
import { Collections, Roles, VerificationStatus } from './helpers/enums'

export type FAILURE_TYPE =
	'MP4' |
	'PROGRESSIVE' |
	'25FPS' |
	'SQUARE_PIXELS' |
	'FORMAT_PROFILE' |
	'FORMAT_LEVEL' |
	'AUDIO_FORMAT' |
	'AUDIO_SAMPLING_RATE' |
	'STEREO' |
	'AUDIO_BITRATE' |
	'VIDEO_DIMENSIONS' |
	'VIDEO_BITRATE'

export interface Entry {
	_id: string
	stationId: string
	categoryId: string
	date: number
	evidenceIds: string[]
	videoLinks?: string
	verified: VerificationStatus
	passesTechSpecs?: boolean
	techSpecFailures?: FAILURE_TYPE[]
	comments?: string
}

export const Entries = new Mongo.Collection<Entry>(Collections.ENTRIES)

if (Meteor.isServer) {
	Meteor.publish(Collections.ENTRIES, function entriesPublictaion () {
		if (Meteor.userId() && UserHasRole([Roles.ADMIN, Roles.HOST, Roles.JUDGE, Roles.EDITOR])) {
			return Entries.find()
		} else if (Meteor.userId() && UserHasRole([Roles.STATION])) {
			return Entries.find({ stationId: (Meteor.user() as NaSTAUser).stationId })
		}
	})
}
