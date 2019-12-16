import { Meteor } from 'meteor/meteor'
import React, { ReactFragment } from 'react'

export function WithAuth (element: ReactFragment) {
	return Meteor.userId() ? element : <div>You need to login</div>
}
