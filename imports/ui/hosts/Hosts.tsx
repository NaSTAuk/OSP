import { Drawer } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Award, Awards } from '/imports/api/awards'
import { Categories } from '/imports/api/categories'
import { Entries } from '/imports/api/entries'
import { Evidence, EvidenceCollection } from '/imports/api/evidence'
import { Collections } from '/imports/api/helpers/enums'
import { CategoryWithEntries, EntryListEvidence } from '/imports/api/helpers/interfaces'
import { Scores } from '/imports/api/scores'
import { Stations } from '/imports/api/stations'
import { CategoryEntriesList } from './CategoryEntriesList'
import { EntryPanel } from './EntryPanel'
import { Results } from '/imports/api/results'
import '/imports/ui/css/Hosts.css'

interface Props {
	loading?: boolean
	awards?: Award[]
	categories?: CategoryWithEntries[]
}

interface State {
	activeEntry?: EntryListEvidence
	drawerVisible: boolean
}

class Hosts extends Component<Props, State> {
	constructor (props: Props) {
		super(props)

		this.state = {
			drawerVisible: false
		}
	}

	public render () {
		if (this.props.loading) return <div></div>
		return (
			<div className='hosts'>
				<Link to='/'>Back</Link>
				<h1>Review Entries</h1>
				{ this.renderAwards() }
				{ this.state.activeEntry &&
					<Drawer
						title={ this.state.activeEntry.stationName }
						placement='right'
						width={ '50%' }
						closable={ true }
						visible={ this.state.drawerVisible }
						onClose={ () => this.drawerClosed() }
					>
						<EntryPanel activeEntry={ this.state.activeEntry } />
					</Drawer>
				}
			</div>
		)
	}

	private drawerClosed () {
		this.setState({
			drawerVisible: false,
			activeEntry: undefined
		})
	}

	private renderAwards () {
		if (!this.props.awards || !this.props.awards.length) return <div>No awards in system</div>

		return this.props.awards.map((award) => {
			return (
				<div key={ award._id }>
					<h1>{ award.name }</h1>
					{ this.renderCategoriesInAward(award) }
				</div>
			)
		})
	}

	private renderCategoriesInAward (award: Award) {
		const categories = this.props.categories ?
			this.props.categories.filter(((cat) => award.categories.includes(cat.category._id!)))
			: []

		return categories.map((category) => {
			return <CategoryEntriesList setActiveEntry={(entry) => this.setActiveEntry(entry)} key={category.category._id} category={category.category} entries={category.entries} results={category.result} />
		})
	}

	private setActiveEntry (activeEntry: EntryListEvidence) {
		() => this.setState({ activeEntry, drawerVisible: true })
	}
}

export default withTracker((props: Props): Props => {

	const handles = [
		Meteor.subscribe(Collections.AWARDS),
		Meteor.subscribe(Collections.CATEGORIES),
		Meteor.subscribe(Collections.ENTRIES),
		Meteor.subscribe(Collections.STATIONS),
		Meteor.subscribe(Collections.SCORES),
		Meteor.subscribe(Collections.RESULTS),
		Meteor.subscribe(Collections.EVIDENCE)
	]

	const categories = Categories.find({ }).fetch()
	const stations = Stations.find({ }).fetch().sort((a, b) => a.name.localeCompare(b.name))
	const categoriesWithEntries: CategoryWithEntries[] = []

	for (let category of categories) {
		const entries: EntryListEvidence[] = []

		for (let station of stations) {
			const entry = Entries.findOne({
				stationId: station._id,
				categoryId: category._id
			}, { sort: { date: -1 } })

			if (!entry) {
				continue
			}

			const evidence: Evidence[] = []
			
			for (let evidenceId of entry.evidenceIds) {
				const ev = EvidenceCollection.findOne({ _id: evidenceId })

				if (ev) {
					evidence.push(ev)
				}
			}
	
			const score = Scores.findOne({
				stationId: station._id, categoryId: entry.categoryId
			}, { sort: { date: -1 } })

			entries.push({
				stationId: station._id,
				stationName: station.name,
				entry,
				evidence,
				score,
				id: entry._id
			})
		}

		const result = Results.findOne({ categoryId: category._id })

		categoriesWithEntries.push({
			category,
			entries,
			result
		})
	}

	const loading = handles.some((handle) => !handle.ready())

	return {
		...props,
		loading,
		awards: Awards.find({ }).fetch(),
		categories: categoriesWithEntries
	}
})(Hosts as any)
