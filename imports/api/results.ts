import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { UserHasRole } from './accounts'
import { Collections, Roles } from './helpers/enums'

export interface DBResult {
	_id?: string
	categoryId: string
	judgedBy: string
	jointFirst?: boolean
	jointHighlyCommended?: boolean
	order: { [stationId: string]: number }
}

export interface Result {
	_id?: string
	categoryId: string
	judgedBy: string
	jointFirst?: boolean
	jointHighlyCommended?: boolean
	order: Map<string, number>
}

export const Results = new Mongo.Collection<Result>(Collections.RESULTS, {
	transform: (result: DBResult) => {
		const oldOrder = result.order
		const newOrder: Map<string, number> = new Map()

		for (let stationId in oldOrder) {
			newOrder.set(stationId, oldOrder[stationId])
		}

		return {
			...result,
			order: newOrder
		}
	}
})

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
