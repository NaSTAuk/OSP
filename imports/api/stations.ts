import { Mongo } from 'meteor/mongo'
import { Collections } from './enums'

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
