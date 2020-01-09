import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { GetUserFromId, UserHasRole } from './accounts'
import { Collections, Roles } from './helpers/enums'

export interface Station {
	_id?: string
	/** Station full name (as written on award). */
	name: string
	/** Whether the station is eligible to enter the awards (is affiliated, not disqualified). */
	eligibleForEntry: boolean
	/** User Ids of users eligable to enter awards on behalf of this station. */
	authorizedUsers: string[]
}

export const Stations = new Mongo.Collection<Station>(Collections.STATIONS)

if (Meteor.isServer) {
	Meteor.publish(Collections.STATIONS, function stationsPublictaion () {
		const id = Meteor.userId()
		if (id) {
			const user = GetUserFromId()
			if (user) {
				if (UserHasRole(Roles.ADMIN)) {
					return Stations.find()
				} else {
					return Stations.find({ _id: user.stationId, authorizedUsers: id })
				}
			}
		}
	})
}

export function GetStationForUser (): Station | undefined {
	const id = Meteor.userId()
	if (id) {
		const user = GetUserFromId()
		if (user && user.stationId) {
			return Stations.findOne({ _id: user.stationId, authorizedUsers: id })
		}
	}
}

export const DEFAULT_STATIONS: Station[] = [
	{
		name: 'NaSTA',
		eligibleForEntry: true,
		authorizedUsers: []
	}
]
