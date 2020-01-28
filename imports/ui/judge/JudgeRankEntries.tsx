import { Button, Checkbox, Drawer, Form, Icon, Tag } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { ItemInterface, ReactSortable } from 'react-sortablejs'
import { Entries, Entry } from '/imports/api/entries'
import { Collections } from '/imports/api/helpers/enums'
import { Station, Stations } from '/imports/api/stations'

import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { RouteComponentProps, withRouter } from 'react-router'
import { SupportingEvidenceList } from './SupportingEvidenceList'
import { Categories } from '/imports/api/categories'
import { Evidence, EvidenceCollection } from '/imports/api/evidence'
import { Result, Results } from '/imports/api/results'
import '/imports/ui/css/Judge.css'

interface EntriesList extends ItemInterface {
	entry: {
		stationId: string,
		stationName: string,
		evidence: Evidence[]
	}
}

interface Props extends RouteComponentProps {
	categoryId: string
	loading?: boolean
	entries?: Entry[]
	stations?: Station[]
	categoryName?: string
	previousResult?: Result
}

interface State {
	entries: EntriesList[]
	init: boolean
	activeEntry?: EntriesList
	drawerVisible: boolean
	jointFirstPlace: boolean
	jointHighlyCommended: boolean
}

class JudgeRankEntries extends Component<Props, State> {

	public static getDerivedStateFromProps (nextProps: Props, prevState: State): State {
		if (prevState.init && !nextProps.loading && nextProps.entries && nextProps.entries.length && nextProps.stations) {
			const entries = nextProps.entries.map((entry, index) => {
				const station = nextProps.stations ?
					nextProps.stations.find((stat) => stat._id === entry.stationId) :
					undefined

				const evidence: Evidence[] = entry.evidenceIds.map((id) => {
					return EvidenceCollection.findOne({ _id: id })
				}).filter((ev) => ev !== undefined) as Evidence[]

				return {
					id: index,
					entry: {
						stationId: entry.stationId,
						stationName: station ? station.name : '',
						evidence
					}
				}
			})

			let showEntries: Array<{ id: number, entry: { stationId: string, stationName: string, evidence: Evidence[] } }> = []

			if (nextProps.previousResult) {
				Object.entries(nextProps.previousResult.order).sort((a, b) => {
					if (a[1] > b[1]) return 1
					if (a[1] < b[1]) return -1

					return 0
				}).forEach((val) => {
					const station = entries.find((entry) => entry.entry.stationId === val[0])
					if (station) showEntries.push(station)
				})

				entries.forEach((entry) => {
					if (!showEntries.some((ent) => ent.entry.stationId === entry.entry.stationId)) {
						showEntries.push(entry)
					}
				})
			} else {
				showEntries = entries
			}

			return {
				init: false,
				entries: showEntries,
				drawerVisible: false,
				jointFirstPlace: nextProps.previousResult ? !!nextProps.previousResult.jointFirst : false,
				jointHighlyCommended: nextProps.previousResult ? !!nextProps.previousResult.jointHighlyCommended : false
			}
		}

		return prevState
	}

	constructor (props: Props) {
		super(props)

		this.state = {
			init: true,
			entries: [],
			drawerVisible: false,
			jointFirstPlace: false,
			jointHighlyCommended: false
		}
	}

	public render () {
		if (this.props.loading) return <div></div>
		return (
			<div className='judge'>
				<Button
					type='link'
					onClick={ () => this.props.history.push(`/judge/${this.props.categoryId}`)}
				>
					Back
				</Button>
				<h1>Final Results for { this.props.categoryName || 'unknown award'}</h1>
				<p>
					Drag stations into the order you'd like to rank them (from first place at the top).
					Clicking on a station will show you a summary of their entry.
				</p>
				<Form layout='inline'>
					<Form.Item>
						Joint First Place
						<Checkbox
							checked={ this.state.jointFirstPlace }
							onChange={ (event) => this.firstPlaceChanged(event) }
						/>
					</Form.Item>
					<Form.Item>
						Joint Highly Commended
						<Checkbox
							checked={ this.state.jointHighlyCommended }
							onChange={ (event) => this.highlyCommendedChanged(event) }
						/>
					</Form.Item>
					<Form.Item>
						<Button type='primary' onClick={ () => this.saveOrder() }>Save</Button>
					</Form.Item>
				</Form>
				<ReactSortable
					className='list'
					list={ this.state.entries}
					setList={ (newState) => this.setState({ entries: newState})}
				>
					{ this.state.entries.map((item, index) => {
						return (
							<div onClick={ () => this.setState({ activeEntry: item, drawerVisible: true })}
								className={ `item ${index < this.state.entries.length ? 'divider' : 'end' }` }
								key={ item.id }
							>
								{
									index === 0 || (index === 1 && this.state.jointFirstPlace) ?
									<Icon type='trophy' style={ { color: 'gold', marginRight: '8px' } } /> :
									index === 1 && !this.state.jointFirstPlace ?
									<Icon type='trophy' style={ { color: 'silver', marginRight: '8px' } } /> :
									index === 2 && (this.state.jointFirstPlace  || this.state.jointHighlyCommended) ?
									<Icon type='trophy' style={ { color: 'silver', marginRight: '8px' } } /> :
									<Tag color={ index < 5 ? 'green' : 'lime' }>
										{ index + 1 }
									</Tag>
								}
								{ item.entry.stationName }
							</div>
						)
					})}
				</ReactSortable>
				<Drawer
					title={ this.state.activeEntry ? this.state.activeEntry.entry.stationName : 'Entry Details' }
					placement='right'
					width={ '50%' }
					closable={ true }
					visible={ this.state.drawerVisible }
					onClose={ () => this.drawerClosed() }
				>
					{ this.renderEntryPanel() }
				</Drawer>
			</div>
		)
	}

	private renderEntryPanel () {
		if(this.state.activeEntry) return <SupportingEvidenceList evidence={ this.state.activeEntry.entry.evidence } />
	}

	private drawerClosed () {
		this.setState({
			drawerVisible: false,
			activeEntry: undefined
		})
	}

	private firstPlaceChanged (event: CheckboxChangeEvent) {
		this.setState({
			jointFirstPlace: event.target.checked
		})
	}

	private highlyCommendedChanged (event: CheckboxChangeEvent) {
		this.setState({
			jointHighlyCommended: event.target.checked
		})
	}

	private async saveOrder () {
		const order: {
			[stationId: string]: number
		} = { }

		this.state.entries.forEach((entry, index) => {
			if (this.state.jointFirstPlace || this.state.jointHighlyCommended) {
				if (
					this.state.jointFirstPlace &&
					this.state.jointHighlyCommended &&
					index < 4
				) {
					if (index === 0 || index === 1) {
						order[entry.entry.stationId] = 1
					} else if (index === 2 || index === 3) {
						order[entry.entry.stationId] = 3
					}
				} else if (this.state.jointFirstPlace && (index === 0 || index === 1)) {
					order[entry.entry.stationId] = 1
				} else if (this.state.jointHighlyCommended && (index === 1 || index === 2)) {
					order[entry.entry.stationId] = 2
				} else {
					order[entry.entry.stationId] = index + 1
				}
			} else {
				order[entry.entry.stationId] = index + 1
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
		Meteor.subscribe(Collections.RESULTS)
	]

	const stations = Stations.find({ }).fetch()

	if (!stations) return { ...props, loading: true }

	const categoryName = Categories.findOne({ _id: props.categoryId })

	if (!categoryName) return { ...props, loading: true }

	const entries: Entry[] = []

	stations.forEach((station) => {
		const entry = Entries.findOne({ stationId: station._id, categoryId: props.categoryId }, { sort: { date: -1 } })

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
		previousResult
	}
})(withRouter(JudgeRankEntries) as any)
