import { Accounts } from 'meteor/accounts-base'
import { check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Random } from 'meteor/random'
import { Roles } from './helpers/enums'
import { Station, Stations } from './stations'

export interface NaSTAUser extends Meteor.User {
	roles: Roles[]
	stationId?: string
}

if (Meteor.isServer) {
	Accounts.onCreateUser((options, user) => {
		const nastaUser: NaSTAUser = {
			...user,
			roles: [Roles.STATION], // TODO: Replace
		}

		if (options.profile) {
			nastaUser.profile = options.profile
		}

		return nastaUser
	})

	Accounts.emailTemplates.siteName = 'NaSTA Submissions Portal'
	Accounts.emailTemplates.from = 'NaSTA Entries <entries@nasta.tv>'
	Accounts.emailTemplates.enrollAccount.subject = () => {
		return `You have been invited to the NaSTA submissions portal`
	}
	Accounts.emailTemplates.enrollAccount.text = (_user, url) => {
		return (
			`You have been invited to the NaSTA submissions portal, click the link below to activate your account\n` +
			`${url}\n` +
			`Any issues, please contact tech@nasta.tv. Replies to this email will not be delivered.`
		)
	}
	Accounts.urls.enrollAccount = (token) => {
		return Meteor.absoluteUrl(`enroll-account/${token}`)
	}
	Accounts.urls.resetPassword = (token) => {
		return Meteor.absoluteUrl(`reset-password/${token}`)
	}

	Meteor.publish('users', () => {
		return Meteor.users.find({}, { fields: { stationId: 1, emails: 1, roles: 1 } })
	})

	Meteor.publish('enrolledUser', (token) => {
		return Meteor.users.find({ 'services.password.reset.token': token })
	})
}

Meteor.methods({
	'accounts.create'(email: string, password: string) {
		check(email, String)
		check(password, String)

		Accounts.createUser({ email, password })
	},
	'accounts.delete'(userId: string) {
		check(userId, String)

		Meteor.users.remove({ _id: userId })
	},
	async 'accounts.new.withStation'(email: string, stationId: string, sendEmail: boolean): Promise<any> {
		check(email, String)
		check(stationId, String)
		check(sendEmail, Boolean)

		if (Meteor.isServer) {
			let id = ''
			try {
				id = await createAccount(email)
			} catch (error) {
				return Promise.reject(error)
			}

			const stationdb = Stations.findOne({ _id: stationId })

			if (!stationdb || !stationdb._id) {
				return Promise.reject(`Failed to find station: ${stationId}`)
			}

			try {
				await addStationIdToUser(id, stationdb._id)
			} catch (error) {
				return Promise.reject(error)
			}

			if (sendEmail) {
				try {
					Accounts.sendEnrollmentEmail(id, email)
				} catch (error) {
					return Promise.reject(error)
				}
			}

			return new Promise((resolve, reject) => {
				Stations.update({ _id: (stationdb as Station)._id }, { $push: { authorizedUsers: id } }, {}, (err: string) => {
					if (err) reject()
					resolve()
				})
			})
		} else {
			return Promise.resolve()
		}
	},
	async 'accounts.endEnrollment'(userId: string) {
		check(userId, String)

		const user = Meteor.users.findOne({ _id: userId })

		if (!user) throw new Meteor.Error(`User ${userId} not found`)

		if (!user.emails || !user.emails[0]) throw new Meteor.Error(`User has no emails registered`)

		try {
			Accounts.sendEnrollmentEmail(user._id, user.emails[0].address)
		} catch (error) {
			return Promise.reject(`Error creating account: ${error}`)
		}
	},
	async 'accounts.new'(email: string): Promise<any> {
		check(email, String)

		let id = ''

		try {
			id = await createAccount(email)
		} catch (error) {
			return Promise.reject(error)
		}

		if (!id) return Promise.reject('Failed to create user')

		try {
			Accounts.sendEnrollmentEmail(id, email)
		} catch (error) {
			return Promise.reject(`Error creating account: ${error}`)
		}

		return Promise.resolve(id)
	},
	'accounts.login'(email: string, password: string) {
		check(email, String)
		check(password, String)

		Meteor.loginWithPassword(email, password)
	},
	'accounts.setPassword'(userId: string, password: string) {
		check(userId, String)
		check(password, String)

		if (!this.isSimulation) {
			try {
				Accounts.setPassword(userId, password)
			} catch (error) {
				throw new Meteor.Error(`Could not set password for user ${userId}`)
			}
		}
	},
})

export function GetUserFromId(): NaSTAUser | undefined {
	const id = Meteor.userId()
	if (id) {
		const user = Meteor.users.findOne({ _id: id })
		if (user) {
			return user as NaSTAUser
		}
	}
}

export function UserHasRole(roles: Roles[]) {
	const user = GetUserFromId()
	if (user) {
		return roles.some((role) => {
			if (user.roles.includes(role)) {
				return true
			}
		})
	}
}

function createAccount(email: string): Promise<any> {
	if (Meteor.users.find({ emails: { $elemMatch: { address: email } } }).count()) {
		throw new Meteor.Error('Email already registered')
	}

	return new Promise((resolve) => {
		const id = Accounts.createUser({ email, password: Random.hexString(12) })

		resolve(id)
	})
}

function addStationIdToUser(userId: string, stationId: string): Promise<any> {
	return new Promise((resolve) => {
		;(Meteor.users as Mongo.Collection<NaSTAUser>).update({ _id: userId }, { $set: { stationId } }, {}, () => {
			resolve()
		})
	})
}
