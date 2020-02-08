import React from 'react'
import { Redirect } from 'react-router'
import { UserHasRole } from '../api/accounts'
import { Roles } from '../api/helpers/enums'
import { Admin } from './Admin'
import Hosts from './hosts/Hosts'

export function GetDefaultRoute () {
	if (UserHasRole([Roles.ADMIN])) {
		return (
			<Admin />
		)
	} else if (UserHasRole([Roles.HOST])) {
		return (
			<Hosts />
		)
	} else if (UserHasRole([Roles.JUDGE])) {
		return <Redirect to='/judge' />
	} else if (UserHasRole([Roles.STATION])) {
		return <Redirect to='/submit' />
	} else {
		return (
			<div key='userRoleError'>
				Something went wrong, please contact tech@nasta.tv and quote your email address and "Role error"
			</div>
		)
	}
}
