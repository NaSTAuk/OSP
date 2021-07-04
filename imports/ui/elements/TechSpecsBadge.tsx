import { Tag } from 'antd'
import React, { Component } from 'react'
import { Entry } from '/imports/api/entries'

export class TechSpecsBadge extends Component<{ entry: Entry }> {
	public render() {
		if (this.props.entry.passesTechSpecs === undefined) {
			return <Tag color="orange">Awaiting Check of Tech Specs</Tag>
		} else if (this.props.entry.passesTechSpecs) {
			return <Tag color="green">Passed Tech Specs</Tag>
		} else {
			return <Tag color="red">Failed Tech Specs</Tag>
		}
	}
}
