import { Meteor } from 'meteor/meteor'
import { Component } from 'react'
import React from 'react'
import { Checkbox, Menu, Form, Dropdown, Divider, Button, Input, Icon } from 'antd'
import { Entries, Entry } from '/imports/api/entries'
import { Evidence, EvidenceCollection } from '/imports/api/evidence'
import { Collections, SupportingEvidenceType, VerificationStatus } from '/imports/api/helpers/enums'
import { TechSpecIssuesList } from '../elements/TechSpecFailures'
import { SupportingEvidenceList } from '../judge/SupportingEvidenceList'
import { Score, Scores } from '/imports/api/scores'
import { withTracker } from 'meteor/react-meteor-data'

interface Props {
	entryId: string
	entry?: Entry
	evidence?: Evidence[]
	score?: Score
}

interface State {
	comments?: string
}

class EntryPanel extends Component<Props, State> {
	constructor(props: Props) {
		super(props)

		this.state = {}
	}

	public static getDerivedStateFromProps(nextProps: Props, prevState: State): State {
		if (!nextProps.entry) {
			return prevState
		}

		return {
			comments: nextProps.entry.comments,
		}
	}

	public render() {
		if (!this.props.entry) return <div></div>

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

		const changeStatus = (status: VerificationStatus) => {
			this.setEntryVerificationStatus(status)
		}

		const verifiedDropdown = (
			<Menu key="stationDropdown">
				<Menu.Item key="verificationDisputed" onClick={() => changeStatus(VerificationStatus.DISPUTED)}>
					{translateStatus(VerificationStatus.DISPUTED)}
				</Menu.Item>
				<Menu.Item key="verificationRejected" onClick={() => changeStatus(VerificationStatus.REJECTED)}>
					{translateStatus(VerificationStatus.REJECTED)}
				</Menu.Item>
				<Menu.Item key="verificationVerified" onClick={() => changeStatus(VerificationStatus.VERIFIED)}>
					{translateStatus(VerificationStatus.VERIFIED)}
				</Menu.Item>
				<Menu.Item key="verificationWaiting" onClick={() => changeStatus(VerificationStatus.WAITING)}>
					{translateStatus(VerificationStatus.WAITING)}
				</Menu.Item>
			</Menu>
		)

		return (
			<React.Fragment>
				<h1>Quick actions</h1>
				<Form>
					<h4>Set Entry Status</h4>
					<Dropdown.Button overlay={verifiedDropdown} icon={<Icon key="down" type="down" />}>
						{translateStatus(this.props.entry.verified)}
					</Dropdown.Button>
					<Form.Item>
						{this.props.evidence?.map((evidence) => {
							return this.renderSupportingEvidenceApproved(evidence)
						})}
					</Form.Item>
				</Form>
				<Divider />
				<h1>Host Comments</h1>
				<Form>
					<Form.Item>
						<Input value={this.state.comments} onChange={(event) => this.commentChange(event)} />
					</Form.Item>
					<Button type="primary" onClick={() => this.saveComments()}>
						Save Comments
					</Button>
				</Form>
				<Divider />
				<h1>Judge Comments</h1>
				{this.props.score?.comments ?? 'No comments yet'}
				<Divider />
				{this.props.evidence?.some((ev) => ev.type === SupportingEvidenceType.VIDEO) ? (
					<React.Fragment>
						<h2>Video Tech Specs</h2>
						<p>
							{this.props.entry.passesTechSpecs === undefined ? (
								'Awaiting Check'
							) : (
								<React.Fragment>
									Passes Tech Specs?
									<Checkbox checked={!!this.props.entry.passesTechSpecs} />
								</React.Fragment>
							)}
							{this.props.entry.techSpecFailures ? (
								<React.Fragment>
									<h3>Issues Meeting Technical Specifications</h3>
									<TechSpecIssuesList failures={this.props.entry.techSpecFailures} />
								</React.Fragment>
							) : undefined}
						</p>
						<Button type="primary" onClick={() => this.rerunCheck()}>
							Rerun Check
						</Button>
					</React.Fragment>
				) : undefined}
				<Divider />
				<h1>Entry</h1>
				<p>Entered at: {new Date(this.props.entry.date).toLocaleString()}</p>
				{this.props.evidence && <SupportingEvidenceList evidence={this.props.evidence} />}
				<Divider />
				<h1>Video Links</h1>
				<p style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{this.props.entry.videoLinks}</p>
			</React.Fragment>
		)
	}

	private setEntryVerificationStatus(status: VerificationStatus) {
		Meteor.call('entry:setVerification', this.props.entryId, status)
	}

	private rerunCheck() {
		Meteor.call('entry:rechecktech', this.props.entryId)
	}

	private renderSupportingEvidenceApproved(evidence: Evidence) {
		return (
			<div key={evidence._id}>
				<b style={{ marginRight: '1%' }}>{this.translateType(evidence.type)}</b>
				<Checkbox checked={evidence.verified} onChange={(event) => this.setVerified(evidence, event.target.checked)} />
			</div>
		)
	}

	private translateType(type: SupportingEvidenceType) {
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

	private commentChange(event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({
			comments: event.target.value,
		})
	}

	private saveComments() {
		Meteor.call('entry:savecomment', this.props.entryId, this.state.comments)
	}

	private async setVerified(evidence: Evidence, verified: boolean) {
		await Meteor.call('evidence:setVerified', evidence._id, verified)
		setTimeout(() => this.forceUpdate(), 1000)
	}
}

export default withTracker((props: Props): Props => {
	Meteor.subscribe(Collections.ENTRIES)
	Meteor.subscribe(Collections.SCORES)
	Meteor.subscribe(Collections.EVIDENCE)

	const entry = Entries.findOne({ _id: props.entryId })

	if (!entry) {
		return props
	}

	return {
		entryId: props.entryId,
		entry,
		evidence: EvidenceCollection.find({ _id: { $in: entry.evidenceIds } }).fetch(),
		score: Scores.findOne(
			{
				stationId: entry.stationId,
				categoryId: entry.categoryId,
			},
			{ sort: { date: -1 } }
		),
	}
})(EntryPanel as any)
