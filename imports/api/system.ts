import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Collections } from './helpers/enums'

export interface SystemProps {
	_id: string
	version: string
	message: string
}

export const System = new Mongo.Collection<SystemProps>(Collections.SYSTEM)

if (Meteor.isServer) {
	Meteor.publish(Collections.SYSTEM, () => {
		return System.find({ })
	})
}
