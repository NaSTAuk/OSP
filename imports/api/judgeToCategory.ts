import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { UserHasRole } from './accounts'
import { Collections, Roles } from './helpers/enums'

export interface JudgeToCategory {
	_id?: string,
	judgeId: string,
	categoryId: string
}

export const JudgeToCategory = new Mongo.Collection<JudgeToCategory>(Collections.JudgeToCategory)

if (Meteor.isServer) {
	Meteor.publish(Collections.JudgeToCategory, () => {
		if (Meteor.userId() && UserHasRole([Roles.JUDGE, Roles.ADMIN, Roles.HOST])) {
			return JudgeToCategory.find({ })
		}
	})
}
