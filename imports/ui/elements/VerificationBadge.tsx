import { Tag } from 'antd'
import React, { Component } from 'react'
import { Entry } from '/imports/api/entries'
import { VerificationStatus } from '/imports/api/helpers/enums'

export class VerificationBadge extends Component<{ entry: Entry }> {
	public render () {
		switch (this.props.entry.verified) {
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
}
