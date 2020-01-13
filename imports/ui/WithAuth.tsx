import { Meteor } from 'meteor/meteor'
import React, { ReactFragment } from 'react'
import { NaSTAUser } from '../api/accounts'
import { Roles } from '../api/helpers/enums'
import { SignIn } from './SignIn'

export function WithAuth (element: ReactFragment, acceptedRoles?: Roles[]) {
	const id = Meteor.userId()
	if (!id) return <SignIn />

	Meteor.subscribe('users')
	const user = Meteor.users.findOne({ _id: id }) as NaSTAUser

	if (!user) return <SignIn />

	if (!acceptedRoles) return element

	console.log(user)

	if (!user.roles) return

	if(user.roles.filter((r) => acceptedRoles.includes(r)).length) return element

	return 'You\'re not authorized to view this page'
}
