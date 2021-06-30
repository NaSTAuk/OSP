import { Component } from 'react'
import React from 'react'
import { Categories, Category } from '/imports/api/categories'
import { withTracker } from 'meteor/react-meteor-data'
import { Meteor } from 'meteor/meteor'
import { Result, Results } from '/imports/api/results'
import { Tag, List } from 'antd'
import { Station } from '/imports/api/stations'
import { Entries, Entry } from '/imports/api/entries'
import { CategoryEntriesListItem } from './CategoryEntriesListItem'
import { Collections } from '/imports/api/helpers/enums'

interface Props {
	categoryId: string
	stations: Station[]
	setActiveEntry: (entryId: string) => void
}

interface TrackedProps {
	category: Category | undefined
	results: Result | undefined
	entries: Entry[] | undefined
	loading: boolean
}

interface State {
	sortBy: 'name' | 'result'
}

class CategoryEntriesList extends Component<Props & TrackedProps, State> {
	constructor(props: Props & TrackedProps) {
		super(props)

		this.state = {
			sortBy: 'name',
		}
	}

	public render() {
		if (this.props.loading || !this.props.category) {
			return <div className="category">Loading ...</div>
		}

		return (
			<div key={this.props.category._id} className="category">
				<h2>{this.props.category.name}</h2>
				<p>
					Sort By&nbsp;
					<b className="sort-by" onClick={() => this.sortCategory('name')}>
						Name
					</b>
					&nbsp;
					<b className="sort-by" onClick={() => this.sortCategory('result')}>
						Result
					</b>
				</p>
				{this.renderEntriesInCategory()}
			</div>
		)
	}

	private sortCategory(sortBy: 'name' | 'result') {
		this.setState({
			sortBy,
		})
	}

	private renderEntriesInCategory() {
		if (!this.props.entries) {
			return (
				<div>
					<Tag color="red">No Entries</Tag>
				</div>
			)
		}

		const list = this.props.entries.sort((a, b) => {
			if (this.state.sortBy === 'result') {
				const rankA = this.props.results?.order.get(a.stationId)
				const rankB = this.props.results?.order.get(b.stationId)
				if (!rankA && !rankB) return 0
				if (!rankA) return 1
				if (!rankB) return -1
				if (rankA > rankB) return 1
				if (rankA < rankB) return -1
				return 0
			} else {
				let stationA = this.props.stations.find((s) => s._id === a.stationId)?.name
				let stationB = this.props.stations.find((s) => s._id === b.stationId)?.name
				if (!stationA && !stationB) return 0
				if (!stationA) return 1
				if (!stationB) return -1
				return stationA.localeCompare(stationB)
			}
		})

		if (!list.length) {
			return (
				<div>
					<Tag color="red">No Entries</Tag>
				</div>
			)
		}

		return (
			<List
				key={this.props.category!._id}
				itemLayout="horizontal"
				dataSource={list}
				renderItem={(entry) => (
					<CategoryEntriesListItem
						key={entry._id}
						categoryId={this.props.categoryId}
						entry={entry}
						station={this.props.stations.find((s) => s._id === entry.stationId)}
						setActiveEntry={(activeEntry) => this.props.setActiveEntry(activeEntry)}
					/>
				)}
				className="list"></List>
		)
	}
}

export default withTracker<Props & TrackedProps, Props>((props: Props) => {
	let handles = [
		Meteor.subscribe(Collections.CATEGORIES),
		Meteor.subscribe(Collections.ENTRIES),
		Meteor.subscribe(Collections.RESULTS),
	]

	let loading = handles.some((h) => !h.ready())

	const category = Categories.findOne({ _id: props.categoryId })

	return {
		...props,
		loading,
		category,
		results: Results.findOne({ categoryId: props.categoryId }),
		entries: Entries.find({ categoryId: props.categoryId }).fetch(),
	}
})(CategoryEntriesList)
