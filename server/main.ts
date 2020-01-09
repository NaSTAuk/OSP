import { Accounts } from 'meteor/accounts-base'
import { Meteor } from 'meteor/meteor'
import '../imports/api/accounts'
import { NaSTAUser } from '../imports/api/accounts'
import '../imports/api/entries'
import '../imports/api/evidence'
import '../imports/api/helpers/methods'
import { Awards, DEFAULT_AWARDS, DEFAULT_CATEGORIES_FOR_AWARDS } from '/imports/api/awards'
import { Categories, Category, DEFAULT_CATEGORIES } from '/imports/api/categories'
import { DEFAULT_STATIONS, Stations } from '/imports/api/stations'

function insertCategory (category: Category) {
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

	if (Meteor.users.find({ }).fetch().length === 0) {
		Accounts.createUser({ email: 'tech@nasta.tv', password: 'password' })
	}

	if (Stations.find().count() === 0) {
		const user = Meteor.users.findOne({ emails: { address: 'tech@nasta.tv', verified: false } })

		if (user) {
			DEFAULT_STATIONS.forEach((station) => {
				Stations.insert({
					...station,
					...{
						authorizedUsers: [user._id]
					}
				})
			})

			const nasta = Stations.findOne({ name: 'NaSTA' })
			if (nasta) {
				Meteor.users.update(user._id, {
					...user,
					stationId: nasta._id
				} as NaSTAUser as Meteor.User)
			}
		}
	}
})
