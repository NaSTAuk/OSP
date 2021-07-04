import { Divider } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Award, Awards } from '../api/awards'
import { Categories, Category } from '../api/categories'
import { Entries, Entry } from '../api/entries'
import { Evidence, EvidenceCollection, EvidenceVideo } from '../api/evidence'
import { Collections, SupportingEvidenceType } from '../api/helpers/enums'
import { Station, Stations } from '../api/stations'

interface EntryWithEvidence {
	entry: Entry
	evidence: Evidence[]
}

interface Props {
	loading?: boolean
	entries?: EntryWithEvidence[]
	categories?: Category[]
	awards?: Award[]
	stations?: Station[]
}

class VideosPage extends Component<Props> {
	public render() {
		if (this.props.loading) return <div>Loading...</div>
		return (
			<div>
				<Link to="/">Back</Link>
				{this.props.awards && this.props.categories && this.props.entries
					? this.renderEntries(this.props.awards, this.props.categories, this.props.entries)
					: undefined}
			</div>
		)
	}

	private renderEntries(awards: Award[], categories: Category[], entries: EntryWithEvidence[]) {
		return (
			<React.Fragment>
				{awards.map((award) => {
					return (
						<div key={award._id}>
							<h1>{award.name}</h1>
							{categories
								.filter((category) => category.forAwards === award.name)
								.map((category) => {
									return this.renderCategory(
										category,
										entries.filter((entry) => entry.entry.categoryId === category._id)
									)
								})}
						</div>
					)
				})}
			</React.Fragment>
		)
	}

	private renderCategory(category: Category, entries: EntryWithEvidence[]) {
		return (
			<React.Fragment key={category._id}>
				<h2>{category.name}</h2>
				<h3>Full Entries</h3>
				<ul>{this.renderLinks(entries, 'sharingLink')}</ul>
				<h3>10 Second Clips</h3>
				<ul>{this.renderLinks(entries, 'shortClipSharingLink')}</ul>
				<Divider />
			</React.Fragment>
		)
	}

	private renderLinks(
		entries: EntryWithEvidence[],
		linkType: keyof Pick<EvidenceVideo, 'sharingLink' | 'shortClipSharingLink'>
	) {
		return entries.map((entry) => {
			const station = this.props.stations
				? this.props.stations.find((st) => st._id === entry.entry.stationId)
				: undefined

			if (!station) return

			return entry.evidence
				.filter((ev) => ev.type === SupportingEvidenceType.VIDEO)
				.map((video) => {
					return (
						<li key={`${linkType}_${video._id}`}>
							<a href={(video as EvidenceVideo)[linkType].replace(/dl=0/, 'dl=1')} target="_blank">{station.name}</a>
						</li>
					)
				})
		})
	}
}

export default withTracker((props: Props): Props => {
	const handles = [
		Meteor.subscribe(Collections.AWARDS),
		Meteor.subscribe(Collections.CATEGORIES),
		Meteor.subscribe(Collections.ENTRIES),
		Meteor.subscribe(Collections.STATIONS),
		Meteor.subscribe(Collections.EVIDENCE),
	]

	const categories = Categories.find({}).fetch()
	const stations = Stations.find({})
		.fetch()
		.sort((a, b) => a.name.localeCompare(b.name))
	const entries: Entry[] = []

	categories.forEach((category) => {
		stations.forEach((station) => {
			const entry = Entries.findOne(
				{
					stationId: station._id,
					categoryId: category._id,
				},
				{ sort: { date: -1 } }
			)

			if (entry) entries.push(entry)
		})
	})

	const entriesWithEvidence: EntryWithEvidence[] = []

	entries.forEach((entry) => {
		const evidenceList: Evidence[] = []
		entry.evidenceIds.forEach((ev) => {
			const evidence = EvidenceCollection.findOne({ _id: ev })

			if (evidence) evidenceList.push(evidence)
		})
		entriesWithEvidence.push({ entry, evidence: evidenceList })
	})

	const loading = handles.some((handle) => !handle.ready())

	return {
		...props,
		loading,
		awards: Awards.find({}).fetch(),
		categories,
		entries: entriesWithEvidence,
		stations,
	}
})(VideosPage)
