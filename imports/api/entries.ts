import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { UserHasRole } from './accounts'
import { Collections, Roles } from './helpers/enums'

export interface Entry {
	_id?: string
	stationId: string
	awardId: string
	date: number
	evidenceIds: string[]
}

export const Entries = new Mongo.Collection<Entry>(Collections.ENTRIES)

if (Meteor.isServer) {
	Meteor.publish(Collections.ENTRIES, function entriesPublictaion () {
		if (Meteor.userId()) {
			if (UserHasRole(Roles.ADMIN)) {
				return Entries.find()
			}
		}
	})
}
