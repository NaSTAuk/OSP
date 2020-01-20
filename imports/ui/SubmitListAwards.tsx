import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import { Award, Awards } from '../api/awards'
import { Collections } from '../api/helpers/enums'

interface Props extends RouteComponentProps {
	loading: boolean
	awards: Award[]
}

class SubmitListAwards extends Component<Props> {
	public render () {
		if (this.props.loading) return <div></div>
		return (
			<div>
				<h1>Awards Open For Entry</h1>
				<ul>
					{ this.renderAwards() }
				</ul>
			</div>
		)
	}

	private renderAwards () {
		return this.props.awards.filter((award) => award.active).map((award) => {
			return (
				<li key={ award._id }>
					<Link to={ (location) => `${location.pathname.replace(/\/$/,'')}/${award._id}` }>{ award.name }</Link>
				</li>
			)
		})
	}
}

export default withTracker(() => {
	const handles = [
		Meteor.subscribe(Collections.AWARDS)
	]

	const loading = handles.some((handle) => !handle.ready())

	return {
		loading,
		awards: Awards.find().fetch()
	}
})(withRouter(SubmitListAwards) as any)
