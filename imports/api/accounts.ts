import { Accounts } from 'meteor/accounts-base'
import { check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Roles } from './helpers/enums'
import { Station } from './stations'

export interface NaSTAUser extends Meteor.User {
	roles: Roles[],
	stationId?: string
}

if (Meteor.isServer) {
	Accounts.onCreateUser((options, user) => {
		const nastaUser: NaSTAUser = {
			...user,
			roles: [ Roles.ADMIN ] // TODO: Replace
		}

		if (options.profile) {
			nastaUser.profile = options.profile
		}

		return nastaUser
	})

	Meteor.publish('users', () => {
		return Meteor.users.find({ }, { fields: { stationId: 1, emails: 1, roles: 1 } })
	})
}

Meteor.methods({
	'accounts.create' (email: string, password: string) {
		check(email, String)
		check(password, String)

		// TODO: Accounts.sendEnrollmentEmail: https://docs.meteor.com/api/passwords.html
		Accounts.createUser({ email, password})
	},
	async 'accounts.new' (email: string): Promise<any> {
		check(email, String)

		throw new Meteor.Error('Not implemented!')
	},
	'accounts.login' (email: string, password: string) {
		check(email, String)
		check(password, String)

		Meteor.loginWithPassword(email, password)
	}
})

export function GetUserFromId (): NaSTAUser | undefined {
	const id = Meteor.userId()
	if (id) {
		const user = Meteor.users.findOne({ _id: id })
		if (user) {
			return user as NaSTAUser
		}
	}
}

export function UserHasRole (roles: Roles[]) {
	const user = GetUserFromId()
	if (user) {
		return !!roles.map((role) => {
			if (user.roles.includes(role)) {
				return true
			}
		}).length
	}
}
