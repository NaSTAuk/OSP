import { Checkbox, Form, message, Popconfirm } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Award, Awards } from '/imports/api/awards'
import { Collections } from '/imports/api/helpers/enums'

interface Props {
	awards: Award[]
}

class ManageAwards extends Component<Props> {
	public render() {
		return (
			<div>
				<Link to="/manage">Back</Link>
				<h1>Awards</h1>
				{this.props.awards.map((award) => {
					return this.renderAward(award)
				})}
			</div>
		)
	}

	private renderAward(award: Award) {
		const toggleAward = () => {
			if (award.active) {
				message.success('Awards closed')
			} else {
				message.success('Awards opened')
				message.success('Good luck to all!')
			}
			this.toggleAward(award)
		}

		return (
			<React.Fragment>
				<h1>{award.name}</h1>
				<Form>
					<Form.Item>
						<h2>Awards Open</h2>
						<Popconfirm
							title={
								award.active
									? 'Are you sure you want to close these awards?'
									: ' Are you sure you want to open these awards?'
							}
							onConfirm={() => toggleAward()}
							okText="Yes"
							cancelText="No">
							<Checkbox checked={award.active} />
						</Popconfirm>{' '}
						:
					</Form.Item>
				</Form>
			</React.Fragment>
		)
	}

	private async toggleAward(award: Award) {
		Meteor.call('awards:toggleActive', award._id)
	}
}

export default withTracker(() => {
	Meteor.subscribe(Collections.AWARDS)

	return {
		awards: Awards.find({}).fetch(),
	}
})(ManageAwards)
