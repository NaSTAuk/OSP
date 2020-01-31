import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { UserHasRole } from './accounts'
import { Collections, Roles } from './helpers/enums'

export interface Score {
	_id?: string
	stationId: string
	categoryId: string
	judgedBy: string
	comments: string
	date: number
}

export const Scores = new Mongo.Collection<Score>(Collections.SCORES)

if (Meteor.isServer) {
	Meteor.publish(Collections.SCORES, () => {
		if (Meteor.userId() && UserHasRole([Roles.ADMIN, Roles.HOST, Roles.JUDGE])) {
			return Scores.find({ })
		}
	})
}
