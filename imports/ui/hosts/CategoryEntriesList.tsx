import { Component } from 'react'
import React from 'react'
import { List, Tag } from 'antd'
import { Category } from '/imports/api/categories'
import { Result } from '/imports/api/results'
import { CategoryEntriesListItem } from './CategoryEntriesListItem'
import { EntryListEvidence } from '/imports/api/helpers/interfaces'

interface Props {
	category: Category
	entries: EntryListEvidence[]
	results?: Result
	setActiveEntry: (activeEntry: EntryListEvidence) => void
}

interface State {
	sortBy: 'name' | 'result'
}

export class CategoryEntriesList extends Component<Props, State> {
	constructor(props: Props) {
		super(props)

		this.state = {
			sortBy: 'name',
		}
	}

	public render() {
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
		const list = this.props.entries.sort((a, b) => {
			if (this.state.sortBy === 'result') {
				if (!this.props.results) return 0
				const rankA = this.props.results.order.get(a.entry.stationId)
				const rankB = this.props.results.order.get(b.entry.stationId)

				if (!rankA && !rankB) return 0
				if (!rankA) return 1
				if (!rankB) return -1

				if (rankA > rankB) return 1
				if (rankA < rankB) return -1

				return 0
			} else {
				return a.stationName.localeCompare(b.stationName)
			}
		})

		if (!list.length)
			return (
				<div>
					<Tag color="red">No Entries</Tag>
				</div>
			)

		return (
			<List
				key={this.props.category._id}
				itemLayout="horizontal"
				dataSource={list}
				renderItem={(entry) => (
					<CategoryEntriesListItem
						setActiveEntry={(activeEntry) => this.props.setActiveEntry(activeEntry)}
						key={entry.entry._id}
						entryWithEvidence={entry}
						results={this.props.results}
					/>
				)}
				className="list"></List>
		)
	}
}
