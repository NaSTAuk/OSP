import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import '/imports/ui/css/Manage.css'

export class Manage extends Component {
	public render () {
		return (
			<div>
				<Link to='/'>Back</Link>
				<div key='manageMenu' className='menu'>
					<Link to='/manage/users'>Manage Users</Link>
					<Link to='/manage/stations'>Manage Stations</Link>
					<Link to='/manage/judges'>Manage Judges</Link>
				</div>
			</div>
		)
	}
}
