import { Mongo } from 'meteor/mongo'
import { Collections } from './helpers/enums'

export interface SystemProps {
	version: string
}

export const System = new Mongo.Collection<SystemProps>(Collections.SYSTEM)
