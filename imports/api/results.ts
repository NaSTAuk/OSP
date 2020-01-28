import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { UserHasRole } from './accounts'
import { Collections, Roles } from './helpers/enums'

export interface Result {
	_id?: string
	categoryId: string
	judgedBy: string
	jointFirst?: boolean
	jointHighlyCommended?: boolean
	order: {
		[stationId: string]: number
	}
}

export const Results = new Mongo.Collection<Result>(Collections.RESULTS)

if (Meteor.isServer) {
	Meteor.publish(Collections.RESULTS, () => {
		if (Meteor.userId()) {
			if (UserHasRole([Roles.ADMIN, Roles.HOST, Roles.JUDGE])) {
				return Results.find({ })
			} else if (UserHasRole([Roles.JUDGE])) {
				return [] // TODO
			} else {
				return []
			}
		}
	})
}
