import { Accounts } from 'meteor/accounts-base'
import { check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Roles } from './enums'

export interface NaSTAUser extends Meteor.User {
	roles: Roles[]
}

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

Meteor.methods({
	'accounts.create' (email: string, password: string) {
		check(email, String)
		check(password, String)

		// TODO: Accounts.sendEnrollmentEmail: https://docs.meteor.com/api/passwords.html
		Accounts.createUser({ email, password})
	},
	'accounts.login' (email: string, password: string) {
		check(email, String)
		check(password, String)

		Meteor.loginWithPassword(email, password)
	}
})
