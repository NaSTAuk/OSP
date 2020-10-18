import { Component } from "react"
import React from 'react'
import { List, Tag, Icon } from 'antd'
import { Result } from '/imports/api/results'
import { Entry } from "/imports/api/entries"
import { SupportingEvidenceType } from '/imports/api/helpers/enums'
import { VerificationBadge } from '../elements/VerificationBadge'
import { TechSpecsBadge } from '../elements/TechSpecsBadge'
import { EntryListEvidence } from "/imports/api/helpers/interfaces"

interface Props {
    entryWithEvidence: EntryListEvidence
    results?: Result
    setActiveEntry: (activeEntry: EntryListEvidence) => void
}

export class CategoryEntriesListItem extends Component<Props> {
    public render () {
        return (
            <List.Item
                key={ this.props.entryWithEvidence._id} className='item'
                onClick={
                    () => this.props.setActiveEntry(this.props.entryWithEvidence)
                }
            >
                <div className='content'>
                    <b>{ this.props.entryWithEvidence.stationName }</b>
                    <span className='badges'>
                        {
                            this.renderJudgedBadge()
                        }
                        {
                            this.props.entryWithEvidence.evidence.some((ev) => ev.type === SupportingEvidenceType.VIDEO) ?
                             <TechSpecsBadge entry={ this.props.entryWithEvidence.entry } /> : undefined
                        }
                        {
                            this.renderVerificationBadge(this.props.entryWithEvidence.entry)
                        }
                        {
                            this.renderResultBadge(this.props.entryWithEvidence.entry, this.props.results)
                        }
                    </span>
                </div>
            </List.Item>
        )
    }

    private renderJudgedBadge () {
		if (!this.props.entryWithEvidence.score) {
            return <Tag color='red'>Not Judged</Tag>
        }

        return <Tag color='green'>Judged</Tag>
	}

	private renderVerificationBadge (entry: Entry) {
		return <VerificationBadge entry={ entry } />
	}

	private renderResultBadge (entry: Entry, result?: Result) {
		if (!result) return <Tag color='red'>No Result</Tag>

        const place = result.order.get(entry.stationId)

		if (!place) return <Tag color='red'>No Result</Tag>

		const position = place

		return (
			<Tag color={ position === 1 ? 'gold' : position === 2 ? 'silver' : position < 5 ? 'green' : 'lime' }>
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