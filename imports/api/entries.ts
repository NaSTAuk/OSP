import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { NaSTAUser, UserHasRole } from './accounts'
import { Collections, Roles } from './helpers/enums'

export interface Entry {
	_id?: string
	stationId: string
	categoryId: string
	date: number
	evidenceIds: string[]
}

export const Entries = new Mongo.Collection<Entry>(Collections.ENTRIES)

if (Meteor.isServer) {
	Meteor.publish(Collections.ENTRIES, function entriesPublictaion () {
		if (Meteor.userId() && UserHasRole([Roles.ADMIN, Roles.HOST, Roles.JUDGE])) {
			return Entries.find()
		} else {
			return Entries.find({ stationId: (Meteor.user() as NaSTAUser).stationId })
		}
	})
}
