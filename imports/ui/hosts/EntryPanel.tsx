import { Meteor } from "meteor/meteor"
import { Component } from "react"
import React from 'react'
import { Checkbox, Menu, Form, Dropdown, Divider, Button, Input, Icon } from 'antd'
import { Entry } from "/imports/api/entries"
import { Evidence } from "/imports/api/evidence"
import { SupportingEvidenceType, VerificationStatus } from "/imports/api/helpers/enums"
import { TechSpecIssuesList } from "../elements/TechSpecFailures"
import { SupportingEvidenceList } from "../judge/SupportingEvidenceList"
import { EntryListEvidence } from "/imports/api/helpers/interfaces"

interface Props {
    activeEntry: EntryListEvidence
}

export class EntryPanel extends Component<Props> {
    public render () {

		if(!this.props.activeEntry) return <div></div>

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
			this.setEntryVerificationStatus(this.props.activeEntry.entry, status)
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
					<h4>Set Entry Status</h4>
					<Dropdown.Button overlay={ verifiedDropdown} icon={ <Icon key='down' type='down' /> }>
						{
							translateStatus(
								this.props.activeEntry.entry.verified
							)
						}
					</Dropdown.Button>
					<Form.Item>
						{
							this.props.activeEntry.evidence.map((evidence) => {
								return this.renderSupportingEvidenceAproved(evidence)
							})
						}
					</Form.Item>
				</Form>
				<Divider />
				<h1>Host Comments</h1>
				<Form>
					<Form.Item>
						<Input value={ this.props.activeEntry.comments } onChange={ (event) => this.commentChange(event) } />
					</Form.Item>
					<Button type='primary' onClick={ () => this.saveComments(this.props.activeEntry!.entry) }>
						Save Comments
					</Button>
				</Form>
				<Divider />
				<h1>Judge Comments</h1>
				{
					this.props.activeEntry.judgesComments || 'No comments yet'
				}
				<Divider />
				{
					this.props.activeEntry.evidence.some((ev) => ev.type === SupportingEvidenceType.VIDEO) ?
					<React.Fragment>
						<h2>Video Tech Specs</h2>
						<p>
							{
								this.props.activeEntry.entry.passesTechSpecs === undefined ?
								'Awaiting Check' :
								<React.Fragment>
									Passes Tech Specs?<Checkbox checked={ !!this.props.activeEntry.entry.passesTechSpecs } />
								</React.Fragment>
							}
							{
								this.props.activeEntry.entry.techSpecFailures ?
								<React.Fragment>
									<h3>Issues Meeting Technical Specifications</h3>
									<TechSpecIssuesList failures={ this.props.activeEntry.entry.techSpecFailures } />
								</React.Fragment> : undefined
							}
						</p>
						<Button type='primary' onClick={ () => this.rerunCheck(this.props.activeEntry!.entry) }>Rerun Check</Button>
					</React.Fragment> : undefined
				}
				<Divider />
				<h1>Entry</h1>
				<p>
					Entered at: { new Date(this.props.activeEntry.entry.date).toLocaleString() }
				</p>
				<SupportingEvidenceList evidence={ this.props.activeEntry.evidence } />
				<Divider />
				<h1>Video Links</h1>
				<p style={ { wordWrap: 'break-word', whiteSpace: 'pre-wrap' } }>
					{
						this.props.activeEntry.entry.videoLinks
					}
				</p>
			</React.Fragment>
		)
    }
    
    private setEntryVerificationStatus (entry: Entry, status: VerificationStatus) {
		Meteor.call('entry:setVerification', entry._id, status)
	}

	private rerunCheck (entry: Entry) {
		Meteor.call('entry:rechecktech', entry._id)
	}

	private renderSupportingEvidenceAproved (evidence: Evidence) {
		return (
			<div key={ evidence._id }>
				<b style={ { marginRight: '1%' } }>{ this.translateType(evidence.type) }</b>
				<Checkbox checked={ evidence.verified } onChange={ (event) => this.setVerified(evidence, event.target.checked) } />
			</div>
		)
    }
    
    private translateType (type: SupportingEvidenceType) {
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

	private commentChange (event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({
			comments: event.target.value
		})
	}

	private saveComments (entry: Entry) {
		Meteor.call('entry:savecomment', entry._id, this.props.activeEntry.comments)
    }
    
    private async setVerified (evidence: Evidence, verified: boolean) {
		await Meteor.call('evidence:setVerified', evidence._id, verified)
		setTimeout(() => this.forceUpdate(), 1000)
	}
}