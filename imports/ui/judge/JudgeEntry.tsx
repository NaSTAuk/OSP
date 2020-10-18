import { Button, Form } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { RouteComponentProps, withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { Categories, Category } from '../../api/categories'
import { Entries, Entry } from '../../api/entries'
import { Evidence, EvidenceCollection } from '../../api/evidence'
import { Collections } from '../../api/helpers/enums'
import { Score, Scores } from '../../api/scores'
import { Station, Stations } from '../../api/stations'
import { SupportingEvidenceList } from './SupportingEvidenceList'

interface Props extends RouteComponentProps {
	loading?: boolean
	stationId: string
	categoryId: string
	station?: Station
	category?: Category
	entry?: Entry
	evidence?: Evidence[]
	previousScore?: Score
}

interface State {
	init: boolean,
	comments: string
}

class JudgeCategory extends Component<Props, State> {

	public static getDerivedStateFromProps (nextProps: Props, prevState: State): State {
		if (prevState.init && !nextProps.loading) {
			return {
				...prevState,
				comments: nextProps.previousScore ? nextProps.previousScore.comments : '',
				init: false
			}
		}

		return prevState
	}
	constructor (props: Props) {
		super (props)

		this.state = {
			init: true,
			comments: ''
		}
	}

	public render () {
		if (this.props.loading) return <div></div>
		return (
			<div>
				<Link to={ `/judge/${this.props.categoryId}` }>Back</Link>
				<h1>{ this.getTitle() }</h1>
				{ this.props.evidence ? <SupportingEvidenceList evidence={ this.props.evidence } /> : '' }
				{ this.renderJudgingForm() }
			</div>
		)
	}

	private getTitle () {
		return `${
			this.props.category ?
			`Judging ${
				`${this.props.category.name}${
					this.props.station ? ` for ${this.props.station.name}` : ''
				}`
			}` :
			''
		}`
	}

	private renderJudgingForm () {
		return (
			<div key='judgingForm' style={ { paddingBottom: '300px' }}>
				<Form>
					<Form.Item>
						<h1>Your Comments</h1>
						<p>Min 100 characters, current length: { this.state.comments.length }</p>
						<TextArea
							value={ this.state.comments }
							rows={ 20 }
							placeholder='Comments'
							onChange={ (event) => this.commentsChange(event)}
						>

						</TextArea>
					</Form.Item>
					<Form.Item>
						<Button
							onClick={ (event) => this.judge(event)}
							type='primary'
							disabled={ this.state.comments.length < 100 }
						>
							Submit
						</Button>
					</Form.Item>
				</Form>
			</div>
		)
	}

	private commentsChange (event: React.ChangeEvent<HTMLTextAreaElement>) {
		event.preventDefault()

		this.setState({
			comments: event.target.value
		})
	}

	private async judge (event: React.MouseEvent<HTMLElement, MouseEvent>) {
		event.preventDefault()

		if (this.state.comments.length < 100) return

		const comments = this.state.comments

		const id = Meteor.userId()

		if (!id) return

		await Meteor.call('comments.add', this.props.stationId, this.props.categoryId, id, comments)

		this.props.history.push('/judge')
	}
}

export default withTracker((props: Props) => {
	const handles = [
		Meteor.subscribe(Collections.STATIONS),
		Meteor.subscribe(Collections.CATEGORIES),
		Meteor.subscribe(Collections.ENTRIES),
		Meteor.subscribe(Collections.EVIDENCE),
		Meteor.subscribe(Collections.SCORES)
	]

	const station = Stations.findOne({ _id: props.stationId })

	if (!station) return props

	const category = Categories.findOne({ _id: props.categoryId })

	if (!category) return props

	const loading = handles.some((handle) => !handle.ready())

	const entry = Entries.findOne({ stationId: props.stationId, categoryId: props.categoryId }, {
		sort: { date: -1 }
	})

	if (!entry) return props

	const evidence: Evidence[] = []

	entry.evidenceIds.forEach((evidenceId) => {
		const evd = EvidenceCollection.findOne({ _id: evidenceId })

		if (evd) evidence.push(evd)
	})

	const previousScore = Scores.findOne({
		stationId: props.stationId,
		categoryId: props.categoryId
	}, { sort: { date: -1 } })

	return {
		...props,
		loading,
		station,
		category,
		entry,
		evidence,
		previousScore
	}
})(withRouter(JudgeCategory) as any)
