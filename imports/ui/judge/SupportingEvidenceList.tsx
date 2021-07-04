import React, { Component } from 'react'
import { Evidence } from '/imports/api/evidence'
import { SupportingEvidenceType } from '/imports/api/helpers/enums'

interface Props {
	evidence: Evidence[]
}

export class SupportingEvidenceList extends Component<Props> {
	public render() {
		return this.renderSupportingEvidenceList()
	}

	private renderSupportingEvidenceList() {
		return (
			<div key="evidenceContainer">
				{this.props.evidence
					? this.props.evidence.map((evidence) => {
							return this.renderSupportingEvidence(evidence)
					  })
					: undefined}
			</div>
		)
	}

	private renderSupportingEvidence(evidence: Evidence) {
		switch (evidence.type) {
			case SupportingEvidenceType.PDF:
				return (
					<iframe
						key={evidence._id}
						src={`${evidence.sharingLink.replace(/\?dl=0$/, '')}?raw=1`}
						style={{ width: '100%', height: '750px' }}></iframe>
				)
			case SupportingEvidenceType.VIDEO:
				return (
					<video
						key={evidence._id}
						controls={true}
						width="640"
						height="480"
						src={`${evidence.sharingLink.replace(/\?dl=0$/, '')}?raw=1`}
						style={{ width: '100%' }}
						autoPlay={false}></video>
				)
			case SupportingEvidenceType.TEXT:
				return (
					<React.Fragment>
						<h2>Supporting Text</h2>
						<p key={evidence._id} style={{ wordWrap: 'break-word' }}>
							{evidence.content}
						</p>
					</React.Fragment>
				)
		}
	}
}
