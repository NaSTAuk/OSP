import { Meteor } from 'meteor/meteor'
import React, { ReactFragment } from 'react'
import { SignIn } from './SignIn'

export function WithAuth (element: ReactFragment) {
	return Meteor.userId() ? element : <SignIn />
}
