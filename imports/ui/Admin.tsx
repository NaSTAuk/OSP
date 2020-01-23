import { Component } from 'react'
import React from 'react'
import { Link } from 'react-router-dom'

export class Admin extends Component {
	public render () {
		return (
			<div key='adminActivitiesList'>
				<Link to='/submit' style={ { clear: 'both', float: 'left', width: '100%' } }>Enter an award</Link>
				<Link to='/judge' style={ { clear: 'both', float: 'left', width: '100%' } }>Judge an award</Link>
				<Link to='/manage/stations' style={ { clear: 'both', float: 'left', width: '100%' } }>Manage stations</Link>
				<Link to='/manage/users' style={ { clear: 'both', float: 'left', width: '100%' } }>Manage users</Link>
			</div>
		)
	}
}
