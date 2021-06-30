import { Component } from 'react'
import React from 'react'
import { List } from 'antd'
import { Entry } from '/imports/api/entries'
import { VerificationBadge } from '../elements/VerificationBadge'
import { TechSpecsBadge } from '../elements/TechSpecsBadge'
import JudgedBadge from '../elements/JudgedBadge'
import ResultsBadge from '../elements/ResultsBadge'
import { Station } from '/imports/api/stations'

interface Props {
	entry: Entry
	station?: Station
	categoryId: string
	setActiveEntry: (entryId: string) => void
}

export class CategoryEntriesListItem extends Component<Props> {
	public render() {
		return (
			<List.Item
				key={this.props.entry._id}
				className="item"
				onClick={() => this.props.setActiveEntry(this.props.entry._id)}>
				<div className="content">
					<b>{this.props.station?.name ?? 'Unknown'}</b>
					{this.props.station && (
						<span className="badges">
							<JudgedBadge stationId={this.props.station._id} categoryId={this.props.categoryId} />
							<TechSpecsBadge entry={this.props.entry} />
							<VerificationBadge entry={this.props.entry} />
							<ResultsBadge stationId={this.props.station._id} categoryId={this.props.categoryId} />
						</span>
					)}
				</div>
			</List.Item>
		)
	}
}
