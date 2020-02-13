import { List } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import { Award, Awards } from '../../api/awards'
import { Collections } from '../../api/helpers/enums'
import '/imports/ui/css/Submit.css'

interface Props extends RouteComponentProps {
	loading: boolean
	awards: Award[]
}

class SubmitListAwards extends Component<Props> {
	public render () {
		if (this.props.loading) return <div></div>
		return (
			<div className='submit'>
				<Link to='/'>Back</Link>
				<h1>Awards Open For Entry</h1>
				{
					this.props.awards.filter((award) => award.active).length > 0 ?
					<List
						itemLayout='horizontal'
						dataSource={ this.props.awards.filter((award) => award.active) }
						renderItem={ (award) => this.renderAward(award)}
						className='list'
					>

					</List> :
					<h1>There are currently no awards open, check back soon!</h1>
				}
			</div>
		)
	}

	private renderAward (award: Award) {
		return (
			<List.Item
				key={ award._id} className='item'
				onClick={ () => this.props.history.push(`/submit/${award._id}`)}
			>
				<b>{ award.name }</b>
			</List.Item>
		)
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
