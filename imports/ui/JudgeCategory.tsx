import { Button, Form, InputNumber } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { RouteComponentProps, withRouter } from 'react-router'
import { Categories, Category } from '../api/categories'
import { Entries, Entry } from '../api/entries'
import { Evidence } from '../api/evidence'
import { Collections, SupportingEvidenceType } from '../api/helpers/enums'
import { Score, Scores } from '../api/scores'
import { Station, Stations } from '../api/stations'

interface Props extends RouteComponentProps {
	loading: boolean
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
	comments: string,
	score: number
}

class JudgeCategory extends Component<Props, State> {

	public static getDerivedStateFromProps (nextProps: Props, prevState: State): State {
		if (prevState.init && !nextProps.loading) {
			return {
				...prevState,
				comments: nextProps.previousScore ? nextProps.previousScore.comments : '',
				score: nextProps.previousScore ? nextProps.previousScore.score : 20,
				init: false
			}
		}

		return prevState
	}
	constructor (props: Props) {
		super (props)

		this.state = {
			init: true,
			comments: '',
			score: 20
		}
	}

	public render () {
		if (this.props.loading) return <div></div>
		return (
			<div>
				<h1>{ this.getTitle() }</h1>
				{ this.renderSupportingEvidenceList() }
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

	private renderSupportingEvidenceList () {
		return (
			<div key='evidenceContainer'>
				{
					this.props.evidence ?
					this.props.evidence.map((evidence) => {
						return this.renderSupportingEvidence(evidence)
					})
					: undefined
				}
			</div>
		)
	}

	private renderSupportingEvidence (evidence: Evidence) {
		switch(evidence.type) {
			case SupportingEvidenceType.PDF:
				return (
					<iframe
						key={ evidence._id }
						src={ `${evidence.sharingLink.replace(/\?dl=0$/, '')}?raw=1`}
						style={ { width: '100%', height: '750px' } }
					>

					</iframe>
				)
			case SupportingEvidenceType.VIDEO:
				return (
					<video key={ evidence._id }
						controls={ true }
						width='640'
						height='480'
						src={ `${evidence.sharingLink.replace(/\?dl=0$/, '')}?raw=1` }
						style={ { width: '100%' } }
						autoPlay={ true }
					></video>
				)
			case SupportingEvidenceType.TEXT:
				return (
					<div key={ evidence._id }>
						{ evidence.content }
					</div>
				)
		}
	}

	private renderJudgingForm () {
		return (
			<div key='judgingForm' style={ { paddingBottom: '300px' }}>
				<Form>
					<Form.Item>
						<h3>Score</h3>
						<InputNumber
							min={ 1 }
							max={ 20 }
							value={ this.state.score }
							onChange={ (value) => this.scoreChange(value)}
						>
						</InputNumber>
					</Form.Item>
					<Form.Item>
						<h3>Comments</h3>
						Min 100 characters, current length: { this.state.comments.length }
						<TextArea value={ this.state.comments } rows={ 20 } placeholder='Comments' onChange={ (event) => this.commentsChange(event)}>

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
		const score = Math.max(0, Math.min(20, this.state.score)) // Clamp between 0 and 20

		const id = Meteor.userId()

		if (!id) return

		await Meteor.call('score.add', this.props.stationId, this.props.categoryId, id, comments, score)

		this.props.history.push('/judge')
	}

	private scoreChange (value?: number) {
		this.setState({
			score: value || 1
		})
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

	const entry = Entries.findOne({ stationId: props.stationId, categoryId: props.categoryId }{
		sort: { date: -1 }
	})

	if (!entry) return props

	const evidence: Evidence[] = []

	entry.evidenceIds.forEach((evidenceId) => {
		const evd = Evidence.findOne({ _id: evidenceId })

		if (evd) evidence.push(evd)
	})

	const previousScore = Scores.findOne({
		stationId: props.stationId,
		categoryId: props.categoryId,
		judgedBy: Meteor.userId() || undefined
	})

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
