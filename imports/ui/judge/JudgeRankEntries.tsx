import { Button, Checkbox, Drawer, Form, Icon, Tag } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { ReactSortable } from 'react-sortablejs'
import { Entries, Entry } from '/imports/api/entries'
import { Collections, VerificationStatus } from '/imports/api/helpers/enums'
import { Station, Stations } from '/imports/api/stations'

import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { SupportingEvidenceList } from './SupportingEvidenceList'
import { Categories } from '/imports/api/categories'
import { Evidence, EvidenceCollection } from '/imports/api/evidence'
import { EntryListEvidence } from '/imports/api/helpers/interfaces'
import { Result, Results } from '/imports/api/results'
import { Scores } from '/imports/api/scores'
import '/imports/ui/css/Judge.css'

interface Props extends RouteComponentProps {
	categoryId: string
	loading?: boolean
	entries?: Entry[]
	stations?: Station[]
	/** Name of the category being judged */
	categoryName?: string
	/** Previous result/ranking */
	previousResult?: Result
}

interface State {
	entriesList: EntryListEvidence[]
	init: boolean
	activeEntry?: EntryListEvidence
	drawerVisible: boolean
	jointFirstPlace: boolean
	jointHighlyCommended: boolean
}

class JudgeRankEntries extends Component<Props, State> {
	public static getDerivedStateFromProps(nextProps: Props, prevState: State): State {
		if (prevState.init && !nextProps.loading && nextProps.entries && nextProps.entries.length && nextProps.stations) {
			const entries: EntryListEvidence[] = nextProps.entries
				.map((entry) => {
					const station = nextProps.stations
						? nextProps.stations.find((stat) => stat._id === entry.stationId)
						: undefined

					if (!station) return

					const evidence: Evidence[] = entry.evidenceIds
						.map((id) => {
							return EvidenceCollection.findOne({ _id: id })
						})
						.filter((ev) => ev !== undefined) as Evidence[]

					const judgesComments = Scores.findOne(
						{
							stationId: station._id,
							categoryId: entry.categoryId,
						},
						{ sort: { date: -1 } }
					)

					return {
						stationId: entry.stationId,
						stationName: station ? station.name : '',
						evidence,
						comments: judgesComments ? judgesComments.comments : undefined,
						entry,
						entryId: entry._id,
						id: entry._id,
					}
				})
				.filter((entry) => entry !== undefined) as EntryListEvidence[]

			return {
				init: false,
				entriesList: entries,
				drawerVisible: false,
				jointFirstPlace: nextProps.previousResult ? !!nextProps.previousResult.jointFirst : false,
				jointHighlyCommended: nextProps.previousResult ? !!nextProps.previousResult.jointHighlyCommended : false,
			}
		}

		return prevState
	}

	constructor(props: Props) {
		super(props)

		this.state = {
			init: true,
			entriesList: [],
			drawerVisible: false,
			jointFirstPlace: false,
			jointHighlyCommended: false,
		}
	}

	public render() {
		if (this.props.loading) return <div></div>
		return (
			<div className="judge">
				<Button type="link" onClick={() => this.props.history.push(`/judge/${this.props.categoryId}`)}>
					Back
				</Button>
				<h1>Final Results for {this.props.categoryName || 'unknown award'}</h1>
				<p>
					Drag stations into the order you'd like to rank them (from first place at the top). Clicking on a station will
					show you a summary of their entry.
				</p>
				<Form layout="inline">
					<Form.Item>
						<span style={{ marginRight: '5px', color: 'rgb(253, 253, 253)' }}>Joint First Place</span>
						<Checkbox checked={this.state.jointFirstPlace} onChange={(event) => this.firstPlaceChanged(event)} />
					</Form.Item>
					<Form.Item>
						<span style={{ marginRight: '5px', color: 'rgb(253, 253, 253)' }}>Joint Highly Commended</span>
						<Checkbox
							checked={this.state.jointHighlyCommended}
							onChange={(event) => this.highlyCommendedChanged(event)}
						/>
					</Form.Item>
					<Form.Item>
						<Button type="primary" onClick={() => this.saveOrder()}>
							Save
						</Button>
					</Form.Item>
				</Form>
				<ReactSortable
					className="list"
					list={this.state.entriesList}
					setList={(newState) => this.setState({ entriesList: newState })}>
					{this.state.entriesList.map((item, index) => {
						return (
							<div
								onClick={() => this.setState({ activeEntry: item, drawerVisible: true })}
								className={`item ${index < this.state.entriesList.length ? 'divider' : 'end'}`}
								key={item.id}>
								{index === 0 || (index === 1 && this.state.jointFirstPlace) ? (
									<Icon type="trophy" style={{ color: 'gold', marginRight: '8px' }} />
								) : index === 1 && !this.state.jointFirstPlace ? (
									<Icon type="trophy" style={{ color: 'silver', marginRight: '8px' }} />
								) : index === 2 && (this.state.jointFirstPlace || this.state.jointHighlyCommended) ? (
									<Icon type="trophy" style={{ color: 'silver', marginRight: '8px' }} />
								) : index === 3 && (this.state.jointFirstPlace && this.state.jointHighlyCommended) ? (
									<Icon type="trophy" style={{ color: 'silver', marginRight: '8px' }} />
								) : (
									<Tag color={index < 5 ? 'green' : 'lime'}>{index + 1}</Tag>
								)}
								{item.stationName}
							</div>
						)
					})}
				</ReactSortable>
				<Drawer
					title={this.state.activeEntry ? this.state.activeEntry.stationName : 'Entry Details'}
					placement="right"
					width={'50%'}
					closable={true}
					visible={this.state.drawerVisible}
					onClose={() => this.drawerClosed()}>
					{this.renderEntryPanel()}
				</Drawer>
			</div>
		)
	}

	private renderEntryPanel() {
		if (this.state.activeEntry) {
			return (
				<React.Fragment>
					<h1>Your Comments</h1>
					<p style={{ whiteSpace: 'pre-wrap' }}>{this.state.activeEntry.comments}</p>
					<h1>Entry</h1>
					<SupportingEvidenceList evidence={this.state.activeEntry.evidence} />
				</React.Fragment>
			)
		}
	}

	private drawerClosed() {
		this.setState({
			drawerVisible: false,
			activeEntry: undefined,
		})
	}

	private firstPlaceChanged(event: CheckboxChangeEvent) {
		this.setState({
			jointFirstPlace: event.target.checked,
		})
	}

	private highlyCommendedChanged(event: CheckboxChangeEvent) {
		this.setState({
			jointHighlyCommended: event.target.checked,
		})
	}

	private async saveOrder() {
		const order: Map<string, number> = new Map()

		this.state.entriesList.forEach((entry, index) => {
			if (this.state.jointFirstPlace || this.state.jointHighlyCommended) {
				if (this.state.jointFirstPlace && this.state.jointHighlyCommended && index < 4) {
					if (index === 0 || index === 1) {
						order.set(entry.stationId, 1)
					} else if (index === 2 || index === 3) {
						order.set(entry.stationId, 3)
					}
				} else if (this.state.jointFirstPlace && (index === 0 || index === 1)) {
					order.set(entry.stationId, 1)
				} else if (
					(!this.state.jointFirstPlace && this.state.jointHighlyCommended && (index === 1 || index === 2)) ||
					(this.state.jointFirstPlace && this.state.jointHighlyCommended && (index === 2 || index == 3))
				) {
					order.set(entry.stationId, 2)
				} else {
					order.set(entry.stationId, index + 1)
				}
			} else {
				order.set(entry.stationId, index + 1)
			}
		})

		await Meteor.call(
			'result.set',
			this.props.categoryId,
			order,
			this.state.jointFirstPlace,
			this.state.jointHighlyCommended
		)

		this.props.history.push(`/judge/${this.props.categoryId}`)
	}
}

export default withTracker((props: Props): Props => {
	const handles = [
		Meteor.subscribe(Collections.ENTRIES),
		Meteor.subscribe(Collections.STATIONS),
		Meteor.subscribe(Collections.EVIDENCE),
		Meteor.subscribe(Collections.CATEGORIES),
		Meteor.subscribe(Collections.RESULTS),
		Meteor.subscribe(Collections.SCORES),
	]

	const stations = Stations.find({}).fetch()

	if (!stations) return { ...props, loading: true }

	const categoryName = Categories.findOne({ _id: props.categoryId })

	if (!categoryName) return { ...props, loading: true }

	const entries: Entry[] = []

	stations.forEach((station) => {
		const entry = Entries.findOne(
			{
				stationId: station._id,
				categoryId: props.categoryId,
				verified: VerificationStatus.VERIFIED,
			},
			{ sort: { date: -1 } }
		)

		if (entry) entries.push(entry)
	})

	const previousResult = Results.findOne({ categoryId: props.categoryId })

	const loading = handles.some((handle) => !handle.ready())

	return {
		...props,
		entries,
		stations,
		loading,
		categoryName: categoryName.name,
		previousResult,
	}
})(withRouter(JudgeRankEntries) as any)
