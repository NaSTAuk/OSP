import { Button, List, Tag } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import { Award, Awards } from '../../api/awards'
import { Categories, Category } from '../../api/categories'
import { Entries, Entry } from '../../api/entries'
import { Collections } from '../../api/helpers/enums'
import { Station, Stations } from '../../api/stations'

interface Props extends RouteComponentProps {
	loading?: boolean,
	awardId: string,
	award?: Award
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
			<div className='submit'>
				<Button type='link' onClick={ () => this.props.history.push(`/submit`) }>
					Back To Awards
				</Button>
				<h1>Categories open for entry</h1>
				{ this.renderCategories() }
			</div>
		)
	}

	private renderCategories () {
		if (!this.props.award || !this.props.categories) {
			return (<div>Unknown award. <Link to='/submit' >Back to safety</Link></div>)
		}

		return (
			<List
				itemLayout='horizontal'
				dataSource={ this.props.categories.sort((a, b) => a.name.localeCompare(b.name)) }
				renderItem={ (category) => this.renderCategory(this.props.award!, category)}
				className='list'
			>

			</List>
		)
	}

	private renderCategory (award: Award, category: Category) {
		return (
			<List.Item
				key={ category._id} className='item interactive'
				onClick={ () => this.props.history.push(`/submit/${award._id}/${category._id}`)}
			>
				<div style={ { width: '100%', minWidth: '100%' } }>
					<b>{ category.name }</b>
					<span style={ { float: 'right' } }>
						{
							category._id ? this.state.awardsEntered.includes(category._id) ?
							<Tag color='green'>Entered</Tag> : <Tag color='red'>Not Entered</Tag> : <Tag>Unknown</Tag>
						}
					</span>
				</div>
			</List.Item>
		)
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

	const award = Awards.findOne({ _id: props.awardId })

	let categories: Category[] = []

	if (award) {
		categories = Categories.find({ forAwards: award.name }).fetch()
	}

	const loading = handles.some((handle) => !handle.ready())

	return {
		loading,
		awardId: props.awardId,
		award,
		categories,
		entries: Entries.find().fetch(),
		userStation: Stations.find({ authorizedUsers: Meteor.userId() || '_' }).fetch()[0]
	}
})(withRouter(SubmitListCategories) as any)
