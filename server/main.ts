import { Accounts } from 'meteor/accounts-base'
import { Meteor } from 'meteor/meteor'
import uuid from 'uuid'
import '../imports/api/accounts'
import '../imports/api/accounts'
import { NaSTAUser } from '../imports/api/accounts'
import '../imports/api/entries'
import '../imports/api/evidence'
import '../imports/api/helpers/methods'
import '../imports/api/judgeToCategory'
import { JudgeToCategory } from '../imports/api/judgeToCategory'
import '../imports/api/results'
import '../imports/api/scores'
import '../imports/api/stations'
import '../imports/api/system'
import { System } from '../imports/api/system'
import { Awards, DEFAULT_AWARDS, DEFAULT_CATEGORIES_FOR_AWARDS } from '/imports/api/awards'
import { Categories, Category, DEFAULT_CATEGORIES } from '/imports/api/categories'
import { DEFAULT_CATEGORY_NAMES, Roles } from '/imports/api/helpers/enums'
import { DEFAULT_STATIONS, Stations } from '/imports/api/stations'

function insertCategory(category: Category) {
	Categories.insert(category)
}

Meteor.startup(() => {
	if (Categories.find().count() === 0) {
		DEFAULT_CATEGORIES.forEach((category) => {
			insertCategory(category)
		})
	}

	if (Awards.find().count() === 0) {
		DEFAULT_AWARDS.forEach((award) => {
			if (award.name in DEFAULT_CATEGORIES_FOR_AWARDS) {
				DEFAULT_CATEGORIES_FOR_AWARDS[award.name].forEach((category) => {
					const cat = Categories.findOne({ name: category, forAwards: award.name })
					if (cat && cat._id) {
						award.categories.push(cat._id)
					}
				})
			}

			Awards.insert(award)
		})
	}

	if (Meteor.users.find({}).fetch().length === 0) {
		const password = uuid()
		console.log(`Creating user "tech@nasta.tv" with password ${password}`)
		Accounts.createUser({ email: 'tech@nasta.tv', password })
	}

	if (Stations.find().count() === 0) {
		const user = Meteor.users.findOne({ emails: { address: 'tech@nasta.tv', verified: false } })

		if (user) {
			DEFAULT_STATIONS.forEach((station) => {
				Stations.insert({
					...station,
					...{
						authorizedUsers: [user._id],
					},
				})
			})

			const nasta = Stations.findOne({ name: 'NaSTA' })
			if (nasta) {
				Meteor.users.update(user._id, {
					...user,
					stationId: nasta._id,
					roles: [Roles.ADMIN, Roles.JUDGE, Roles.HOST, Roles.STATION],
				} as NaSTAUser as Meteor.User)

				const bestBroadcaster = Categories.findOne({ name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_BEST_BROADCASTER })
				if (bestBroadcaster && nasta._id && bestBroadcaster._id) {
					JudgeToCategory.insert({
						judgeId: user._id,
						categoryId: bestBroadcaster._id,
					})
				}
			}
		}
	}

	if (System.find().fetch().length === 0) {
		System.insert({
			version: 'v1.0',
			messages: [],
		})
	}

	// Clear auth tokens after deploying new version
	if (Meteor.isProduction) {
		Meteor.users.update({}, { $set: { 'services.resume.loginTokens': [] } }, { multi: true })
	}
})
