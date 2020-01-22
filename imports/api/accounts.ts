import { Accounts } from 'meteor/accounts-base'
import { check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Random } from 'meteor/random'
import { Roles } from './helpers/enums'
import { Station, Stations } from './stations'

export interface NaSTAUser extends Meteor.User {
	roles: Roles[],
	stationId?: string
}

if (Meteor.isServer) {
	Accounts.onCreateUser((options, user) => {
		const nastaUser: NaSTAUser = {
			...user,
			roles: [ Roles.STATION ] // TODO: Replace
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
		return `You have been invited to the NaSTA submissions portal, click the link below to activate your account\n`
		+ `${url}\n`
		+ `Any issues, please contact tech@nasta.tv. Replies to this email will not be delivered.`
	}
	Accounts.urls.enrollAccount = (token) => {
		return Meteor.absoluteUrl(`enroll-account/${token}`)
	}

	Meteor.publish('users', () => {
		return Meteor.users.find({ }, { fields: { stationId: 1, emails: 1, roles: 1 } })
	})

	Meteor.publish('enrolledUser', (token) => {
		return Meteor.users.find({ 'services.password.reset.token': token })
	})
}

Meteor.methods({
	'accounts.create' (email: string, password: string) {
		check(email, String)
		check(password, String)

		Accounts.createUser({ email, password})
	},
	'accounts.delete' (userId: string) {
		check (userId, String)

		Meteor.users.remove({ _id: userId })
	},
	async 'accounts.new.withStation' (email: string, station: string): Promise<any> {
		const id = await createAccount(email)

		const stationdb = Stations.findOne({ _id: id })

		if (!stationdb || !stationdb._id) {
			return Promise.reject(`Failed to find station: ${station}`)
		}

		await addStationIdToUser(id, stationdb._id)

		return new Promise((resolve, reject) => {
			Stations.update(
				{ _id: (stationdb as Station)._id },
				{ $push: { authorizedUsers: id } },
				{ },
				((err: string) => {
					if (err) reject()
					resolve()
				})
			)
		})
	},
	async 'accounts.new' (email: string): Promise<any> {
		check(email, String)

		const id = await createAccount(email)

		if (!id) return Promise.reject('Failed to create user')

		Accounts.sendEnrollmentEmail(id, email)

		return Promise.resolve(id)
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

function createAccount (email: string): Promise<any> {
	if (Meteor.users.find({ emails: { $elemMatch: { address: email } } } ).count()) {
		throw new Meteor.Error('Email already registered')
	}

	return new Promise((resolve, reject) => {
		const id = Accounts.createUser({ email, password: Random.hexString(12) })
		if (id) {
			resolve(id)
		} else {
			reject()
		}
	})
}

function addStationIdToUser (userId: string, stationId: string): Promise<any> {
	return new Promise((resolve, reject) => {
		(Meteor.users as Mongo.Collection<NaSTAUser>).update(
			{ _id: userId }, { $set: { stationId } },
			{ },
			((err: string) => {
				if (err) reject(err)
				resolve()
			})
		)
	})
}
