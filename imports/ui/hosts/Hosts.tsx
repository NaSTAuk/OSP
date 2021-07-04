import { Drawer } from 'antd'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Award, Awards } from '/imports/api/awards'
import CategoryEntriesList from './CategoryEntriesList'
import EntryPanel from './EntryPanel'
import '/imports/ui/css/Hosts.css'
import { Station, Stations } from '/imports/api/stations'
import { Meteor } from 'meteor/meteor'
import { Collections } from '/imports/api/helpers/enums'

interface Props {}

interface TrackedProps {
	awards: Award[]
	stations: Station[]
	loading: boolean
}

interface State {
	activeEntryId?: string
	drawerVisible: boolean
}

class Hosts extends Component<Props & TrackedProps, State> {
	constructor(props: Props & TrackedProps) {
		super(props)

		this.state = {
			drawerVisible: false,
		}
	}

	public render() {
		if (this.props.loading) {
			return <div className="hosts">Loading...</div>
		}

		return (
			<div className="hosts">
				<Link to="/">Back</Link>
				<h1>Review Entries</h1>
				{this.renderAwards()}
				{this.state.activeEntryId && (
					<Drawer
						title="Entry"
						placement="right"
						width={'50%'}
						closable={true}
						visible={this.state.drawerVisible}
						onClose={() => this.drawerClosed()}>
						<EntryPanel entryId={this.state.activeEntryId} />
					</Drawer>
				)}
			</div>
		)
	}

	private drawerClosed() {
		this.setState({
			drawerVisible: false,
		})
	}

	private renderAwards() {
		if (!this.props.awards || !this.props.awards.length) return <div>No awards in system</div>

		return this.props.awards.map((award) => {
			return (
				<div key={award._id}>
					<h1>{award.name}</h1>
					{this.renderCategoriesInAward(award)}
				</div>
			)
		})
	}

	private renderCategoriesInAward(award: Award) {
		return award.categories.map((categoryId) => {
			return (
				<CategoryEntriesList
					setActiveEntry={(entryId) => this.setActiveEntry(entryId)}
					key={categoryId}
					categoryId={categoryId}
					stations={this.props.stations}
				/>
			)
		})
	}

	private setActiveEntry(activeEntryId: string) {
		this.setState({ activeEntryId, drawerVisible: true })
	}
}

export default withTracker<Props & TrackedProps, Props>((props: Props) => {
	let handles = [Meteor.subscribe(Collections.AWARDS), Meteor.subscribe(Collections.STATIONS)]

	let loading = handles.some((h) => !h.ready())

	return {
		...props,
		loading,
		awards: Awards.find({}).fetch(),
		stations: Stations.find({}).fetch(),
	}
})(Hosts)
