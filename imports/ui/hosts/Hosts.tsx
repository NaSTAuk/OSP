import { Checkbox, Drawer, Dropdown, Form, Icon, List, Menu, Tag } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { SupportingEvidenceList } from '../judge/SupportingEvidenceList'
import { Award, Awards } from '/imports/api/awards'
import { Categories, Category } from '/imports/api/categories'
import { Entries, Entry } from '/imports/api/entries'
import { Evidence, EvidenceCollection } from '/imports/api/evidence'
import { Collections, SupportingEvidenceType, VerificationStatus } from '/imports/api/helpers/enums'
import { EntriesList, EntryListEvidence } from '/imports/api/helpers/interfaces'
import { Result, Results } from '/imports/api/results'
import { Score, Scores } from '/imports/api/scores'
import { Station, Stations } from '/imports/api/stations'
import '/imports/ui/css/Hosts.css'

interface Props {
	loading?: boolean
	awards?: Award[]
	categories?: Category[]
	entries?: Entry[]
	stations?: Station[]
	scores?: Score[]
}

interface State {
	activeEntry?: EntriesList
	entriesList: EntriesList[]
	drawerVisible: boolean
	sortBy: { [categoryId: string]: 'name' | 'result' }
}

class Hosts extends Component<Props, State> {

	public static getDerivedStateFromProps (nextProps: Props, prevState: State): State {
		if (nextProps.entries && nextProps.entries.length && nextProps.stations) {
			const entries: Array<{ id: number, entry: EntryListEvidence }> = nextProps.entries.map((entry, index) => {
				const station = nextProps.stations ?
					nextProps.stations.find((stat) => stat._id === entry.stationId) :
					undefined

				if (!station) return

				const evidence: Evidence[] = entry.evidenceIds.map((id) => {
					return EvidenceCollection.findOne({ _id: id })
				}).filter((ev) => ev !== undefined) as Evidence[]

				const judgesComments = Scores.findOne({
					stationId: station._id, categoryId: entry.categoryId, judgedBy: Meteor.userId() || ''
				}, { sort: { date: -1 } })

				return {
					id: index,
					entry: {
						stationId: entry.stationId,
						stationName: station ? station.name : '',
						evidence,
						comments: judgesComments ? judgesComments.comments : undefined,
						entry
					}
				}
			}).filter((entry) => entry !== undefined) as Array<{ id: number, entry: EntryListEvidence }>

			const sortBy = prevState.sortBy

			if (nextProps.categories) {
				nextProps.categories.forEach((cat) => {
					if (sortBy[cat._id!] === undefined) {
						sortBy[cat._id!] = 'name'
					}
				})
			}

			let activeEntry = prevState.activeEntry

			if (prevState.activeEntry) {
				activeEntry = entries.find((entry) => entry.id === prevState.activeEntry?.id)
			}

			return {
				...prevState,
				entriesList: entries,
				activeEntry,
				sortBy
			}
		}

		return prevState
	}

	constructor (props: Props) {
		super(props)

		this.state = {
			drawerVisible: false,
			entriesList: [],
			sortBy: { }
		}
	}

	public render () {
		if (this.props.loading) return <div></div>
		return (
			<div className='hosts'>
				<Link to='/'>Back</Link>
				<h1>Review Entries</h1>
				{ this.renderAwards() }
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

	private setEntryVerificationStatus (entry: Entry, status: VerificationStatus) {
		Meteor.call('entry:setVerification', entry._id, status)
	}

	private renderEntryPanel () {

		if(!this.state.activeEntry) return <div></div>

		const translateStatus = (stat: VerificationStatus) => {
			switch (stat) {
				case VerificationStatus.DISPUTED:
					return 'Disputed'
				case VerificationStatus.REJECTED:
					return 'Rejected'
				case VerificationStatus.VERIFIED:
					return 'Verified'
				case VerificationStatus.WAITING:
					return 'Awaiting Verification'
			}
		}

		const changeStatus = (stat: VerificationStatus) => {
			this.setEntryVerificationStatus(this.state.activeEntry!.entry.entry, stat)
		}

		const verifiedDropdown = (
			<Menu key='stationDropdown'>
				<Menu.Item
					key='verificationDisputed'
					onClick={ () => changeStatus(VerificationStatus.DISPUTED) }
				>
					{ translateStatus(VerificationStatus.DISPUTED) }
				</Menu.Item>
				<Menu.Item
					key='verificationRejected'
					onClick={ () => changeStatus(VerificationStatus.REJECTED) }
				>
					{ translateStatus(VerificationStatus.REJECTED) }
				</Menu.Item>
				<Menu.Item
					key='verificationVerified'
					onClick={ () => changeStatus(VerificationStatus.VERIFIED) }
				>
					{ translateStatus(VerificationStatus.VERIFIED) }
				</Menu.Item>
				<Menu.Item
					key='verificationWaiting'
					onClick={ () => changeStatus(VerificationStatus.WAITING) }
				>
					{ translateStatus(VerificationStatus.WAITING) }
				</Menu.Item>
			</Menu>
		)

		return (
			<React.Fragment>
				<h1>Quick actions</h1>
				<Form>
					<h3>Set Entry Status</h3>
					<Dropdown.Button overlay={ verifiedDropdown} icon={ <Icon key='down' type='down' /> }>
						{
							translateStatus(
								this.state.activeEntry.entry.entry.verified ?
								this.state.activeEntry.entry.entry.verified :
								VerificationStatus.WAITING
							)
						}
					</Dropdown.Button>
					<Form.Item>
						{
							this.state.activeEntry.entry.evidence.map((evidence) => {
								return this.renderSupportingEvidenceAproved(evidence)
							})
						}
					</Form.Item>
				</Form>
				<h1>Entry</h1>
				<SupportingEvidenceList evidence={ this.state.activeEntry.entry.evidence } />
			</React.Fragment>
		)
	}

	private renderSupportingEvidenceAproved (evidence: Evidence) {

		const translateType = (type: SupportingEvidenceType) => {
			switch (type) {
				case SupportingEvidenceType.CALL:
					return `Call taken place?`
				case SupportingEvidenceType.PDF:
					return `PDF Apporoved?`
				case SupportingEvidenceType.TEXT:
					return 'Text Approved?'
				case SupportingEvidenceType.VIDEO:
					return 'Video Approved?'
			}
		}

		return (
			<div key={ evidence._id }>
				<b style={ { marginRight: '1%' } }>{ translateType(evidence.type) }</b>
				<Checkbox checked={ evidence.verified } onChange={ (event) => this.setVerified(evidence, event.target.checked) } />
			</div>
		)
	}

	private async setVerified (evidence: Evidence, verified: boolean) {
		await Meteor.call('evidence:setVerified', evidence._id, verified)
		setTimeout(() => this.forceUpdate(), 1000)
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
			if (award.active) {
				return (
					<div key={ award._id }>
						<h1>{ award.name }</h1>
						{ this.renderCategoriesInAward(award) }
					</div>
				)
			}
		})
	}

	private renderCategoriesInAward (award: Award) {
		const categories = this.props.categories ?
			this.props.categories.filter(((cat) => award.categories.includes(cat._id!)))
			: []

		return categories.map((category) => {
			return (
				<div key={ category._id} className='category'>
					<h2>{ category.name }</h2>
					| Sort By&nbsp;
					<b className='sort-by' onClick={ () => this.sortCategory(category._id!, 'name') }>Name</b>&nbsp;
					<b className='sort-by' onClick={ () => this.sortCategory(category._id!, 'result') }>Result</b>
					{ this.renderEntriesInCategory(category) }
				</div>
			)
		})
	}

	private sortCategory (categoryId: string, sort: 'name' | 'result') {
		this.setState({
			sortBy: { ...this.state.sortBy, [categoryId]: sort }
		})
	}

	private renderEntriesInCategory (category: Category) {
		const results = Results.findOne({ categoryId: category._id })

		const list = this.state.entriesList
			.filter((entry) => entry.entry.entry.categoryId === category._id)
			.sort((a, b) => {
				if (this.state.sortBy[category._id!] === 'result') {
					if (!results) return 0
					const rankA = results.order[a.entry.stationId]
					const rankB = results.order[b.entry.stationId]

					if (!rankA && !rankB) return 0
					if (!rankA) return -1
					if (!rankB) return 1

					if (rankA > rankB) return 1
					if (rankA < rankB) return -1

					return 0
				} else {
					return a.entry.stationName.localeCompare(b.entry.stationName)
				}
			})

		if (!list.length) return <div><Tag color='red'>No Entries</Tag></div>

		return (
			<List
				itemLayout='horizontal'
				dataSource={ list }
				renderItem={ (entry) => this.renderEntry(entry, results)}
				className='list'
			>

			</List>
		)
	}

	private renderEntry (entry: EntriesList, result?: Result) {
		return (
			<List.Item
				key={ entry._id} className='item'
				onClick={ () => this.setState({ activeEntry: entry, drawerVisible: true }) }
			>
				<div className='content'>
					<b>{ entry.entry.stationName }</b>
					<span className='badges'>
						{
							this.renderJudgedBadge(entry.entry.entry)
						}
						{
							this.renderVerificationBadge(entry.entry.entry)
						}
						{
							this.renderResultBadge(entry.entry.entry, result)
						}
					</span>
				</div>
			</List.Item>
		)
	}

	private renderJudgedBadge (entry: Entry) {
		if (!this.props.scores) return <Tag color='red'>Not Judged</Tag>

		const score = this.props.scores.find(
			(sc) => sc.stationId === entry.stationId && sc.categoryId === entry.categoryId
		)

		if (score) {
			return (
				<Tag color='green'>Judged</Tag>
			)
		}

		return (
			<Tag color='red'>Not Judged</Tag>
		)
	}

	private renderVerificationBadge (entry: Entry) {
		switch (entry.verified) {
			case VerificationStatus.REJECTED:
				return <Tag color='red'>Rejected</Tag>
			case VerificationStatus.DISPUTED:
				return <Tag color='purple'>Disputed</Tag>
			case VerificationStatus.VERIFIED:
				return <Tag color='green'>Verified</Tag>
			case VerificationStatus.WAITING:
			default:
				return <Tag color='orange'>Awaiting Verification</Tag>

		}
	}

	private renderResultBadge (entry: Entry, result?: Result) {
		if (!result) return <Tag color='red'>No Result</Tag>

		const place = Object.entries(result.order).find(([id]) => id === entry.stationId)

		if (!place) return <Tag color='red'>No Result</Tag>

		const position = place[1]

		return (
			<Tag color={ position === 1 ? 'gold' : position === 2 ? 'silver' : position > 5 ? 'green' : 'lime' }>
				{
					position < 3 ?
					<Icon type='trophy'  /> :
					this.ordinal_suffix_of(position)
				}
			</Tag>
		)
	}

	private ordinal_suffix_of (i: number): string {
		const j = i % 10
		const k = i % 100
		if (j === 1 && k !== 11) {
			return i + 'st'
		}
		if (j === 2 && k !== 12) {
			return i + 'nd'
		}
		if (j === 3 && k !== 13) {
			return i + 'rd'
		}
		return i + 'th'
	}
}

export default withTracker((props: Props) => {

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
	const entries: Entry[] = []

	categories.forEach((category) => {
		stations.forEach((station) => {
			const entry = Entries.findOne({
				stationId: station._id,
				categoryId: category._id
			}, { sort: { date: -1 } })

			if (entry) entries.push(entry)
		})
	})

	const loading = handles.some((handle) => !handle.ready())

	return {
		...props,
		loading,
		awards: Awards.find({ }).fetch(),
		categories,
		entries,
		stations,
		scores: Scores.find({ }).fetch()
	}
})(Hosts as any)
