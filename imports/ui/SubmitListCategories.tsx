import { Col, Row } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import { Award, Awards } from '../api/awards'
import { Categories, Category } from '../api/categories'
import { Entries, Entry } from '../api/entries'
import { Collections } from '../api/helpers/enums'
import { Station, Stations } from '../api/stations'

interface Props extends RouteComponentProps {
	loading?: boolean,
	awardId: string,
	awards?: Award[]
	categories?: Category[]
	entries?: Entry[]
	userStation?: Station
}

interface State {
	init: boolean
	awardsEntered: string[]
}

class SubmitListCategories extends Component<Props, State> {

	public static getDerivedStateFromProps (nextProps: Props, prevState: State): State {
		if (prevState.init && nextProps.userStation && !nextProps.loading) {
			const entered: string[] = []

			if (!nextProps.categories) return prevState
			nextProps.categories.forEach((category) => {
				if (category._id) {
					const entry = nextProps.entries ? nextProps.entries.find(
						(ent) => {
							return ent.categoryId === category._id && nextProps.userStation && ent.stationId === nextProps.userStation._id
						}
					) : undefined

					if (entry) {
						entered.push(category._id)
					}
				}
			})

			return {
				...prevState,
				awardsEntered: entered,
				init: false
			}
		}

		return prevState
	}

	constructor (props: Props) {
		super(props)

		this.state = {
			init: true,
			awardsEntered: []
		}
	}

	public render () {
		if (this.props.loading || this.state.init) return <div></div>
		return (
			<div>
				<h1>Categories open for entry</h1>
				{ this.renderCategories(this.props.awardId) }
			</div>
		)
	}

	private renderCategories (awardId: string) {
		const award = this.props.awards ? this.props.awards.find((a) => a._id === awardId) : undefined

		if (!award) {
			return (<div>Unknown award. <Link to='/submit' >Back to safety</Link></div>)
		}

		return award.categories.map((categoryId) => {
			const category = this.props.categories ? this.props.categories.find((c) => c._id === categoryId) : undefined

			if (category) {
				return (
					<Row gutter={ [32, 4]} style={ { borderBottom: '1px solid black', width: '100%' }}>
						<Col span={ 10 }>
							<Link to={ (location) => `${location.pathname.replace(/\/$/,'')}/${category._id}` }>{ category.name }</Link>
						</Col>
						<Col span={ 14 }>
							{
								category._id ? this.state.awardsEntered.includes(category._id) ? 'Entered' : 'Not Entered' : 'nyet'
							}
						</Col>
					</Row>
				)
			}
		})
	}
}

export default withTracker((props: Props) => {
	const handles = [
		Meteor.subscribe(Collections.AWARDS),
		Meteor.subscribe(Collections.CATEGORIES),
		Meteor.subscribe(Collections.STATIONS),
		Meteor.subscribe(Collections.ENTRIES),
		Meteor.subscribe('users')
	]

	const loading = handles.some((handle) => !handle.ready())

	return {
		loading,
		awardId: props.awardId,
		awards: Awards.find().fetch(),
		categories: Categories.find().fetch(),
		entries: Entries.find().fetch(),
		userStation: Stations.find({ authorizedUsers: Meteor.userId() || '_' }).fetch()[0]
	}
})(withRouter(SubmitListCategories) as any)
