import { List, Tag } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { RouteComponentProps } from 'react-router'
import { NaSTAUser } from '../api/accounts'
import { Categories, Category } from '../api/categories'
import { Entries, Entry } from '../api/entries'
import { Collections, Roles } from '../api/helpers/enums'
import { JudgeToCategory } from '../api/judgeToCategory'
import { Score, Scores } from '../api/scores'
import { Station, Stations } from '../api/stations'
import '/imports/ui/css/Judge.css'

interface Props extends RouteComponentProps {
	loading: boolean
	user?: NaSTAUser
	category?: Category
	stations: Station[]
	entries: Entry[]
	scores: Score[]
}

class Judge extends Component<Props> {

	constructor (props: Props) {
		super(props)

		this.state = { }
	}

	public shouldComponentUpdate (nextProps: Props, _nextState: any) {
		return !nextProps.loading
	}

	public render () {
		if (this.props.loading) return <div></div>
		return (
			<div className='judge'>
				<h1>
					Judging{ this.props.category ? ` ${this.props.category.name}` : '' }
				</h1>
				<h2>Entries to judge</h2>
				<List
					itemLayout='horizontal'
					dataSource={ this.props.entries }
					renderItem={ (entry) => this.renderEntry(entry)}
					className='list'
				>

				</List>
			</div>
		)
	}

	private renderEntry (entry: Entry) {
		const station = Stations.findOne({ _id: entry.stationId })

		if (!station) return

		const categoryId = this.props.category ? this.props.category._id : undefined

		if (!categoryId) return

		const judged = !!Scores.findOne({ categoryId, stationId: station._id })

		return (
			<List.Item key={ entry._id} className='item' onClick={ () => this.goToJudgePage(station._id, categoryId)} >
				{ judged ? <Tag color='green' >Judged</Tag> : <Tag color='orange' >Not Judged</Tag> }
				<b>{ station.name }</b>
			</List.Item>
		)
	}

	private goToJudgePage (stationId?: string, categoryId?: string) {
		if (!stationId || !categoryId) return

		this.props.history.push(`/judge/${stationId}/${categoryId}`)
	}
}

export default withTracker((props: Props) => {
	const handles = [
		Meteor.subscribe(Collections.CATEGORIES),
		Meteor.subscribe(Collections.JudgeToCategory),
		Meteor.subscribe(Collections.ENTRIES),
		Meteor.subscribe(Collections.STATIONS),
		Meteor.subscribe(Collections.SCORES),
		Meteor.subscribe('users')
	]

	const user = Meteor.user() as NaSTAUser

	if (!user) return props

	if (!user.roles.includes(Roles.JUDGE)) return props

	const judgeToCat = JudgeToCategory.findOne({ judgeId: user._id })

	if (!judgeToCat) return props

	const category = Categories.findOne({ _id: judgeToCat.categoryId })

	if (!category) return props

	const entries: Entry[] = []

	/** Find only the latest entry for each station. */
	Stations.find({ }).fetch().forEach((station) => {
		const latest = Entries.findOne({
			categoryId: category._id,
			stationId: station._id
		}, {
			sort: { date: -1 }
		})

		if (latest) entries.push(latest)
	})

	const loading = handles.some((handle) => !handle.ready())

	return {
		loading,
		category,
		entries,
		stations: Stations.find({ }).fetch(),
		scores: Scores.find({ }).fetch(),
		user
	}
})(withRouter(Judge) as any)
