import { Meteor } from 'meteor/meteor'
import '../imports/api/accounts'
import '../imports/api/methods'
import { Awards, DEFAULT_AWARDS, DEFAULT_CATEGORIES_FOR_AWARDS } from '/imports/api/awards'
import { Categories, Category, DEFAULT_CATEGORIES } from '/imports/api/categories'

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
})
