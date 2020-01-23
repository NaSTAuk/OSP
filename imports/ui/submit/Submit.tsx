import { Button } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component, FormEvent } from 'react'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import { Categories, Category } from '../../api/categories'
import { Entries, Entry } from '../../api/entries'
import { MINUTE } from '../../api/helpers/constants'
import { Collections, SupportingEvidenceType } from '../../api/helpers/enums'
import { Station, Stations } from '../../api/stations'
import { SupportingEvidence } from '../../api/supporting-evidence'
import { Upload } from '../elements/Upload'
import { TextInput } from '../TextInput'
import '/imports/ui/css/Submit.css'

interface Props extends RouteComponentProps {
	loading?: boolean
	awardId: string
	categoryId: string
	userStation?: Station
	categories?: Category[]
	entries?: Entry[]
}

interface State {
	supportingEvidenceRefs: { [key: string]: boolean }
	values: { [key: string]: string }
	init: boolean
	error: string
	category?: Category
	valid: boolean
}

/** Creates a menu of awards open for submission */
class Submit extends Component<Props, State> {

	public static getDerivedStateFromProps (nextProps: Props, prevState: State): State {
		if (prevState.init && nextProps.userStation && !nextProps.loading) {
			if (!nextProps.categories) return prevState

			const cat = nextProps.categories.find((c) => c._id === nextProps.categoryId)

			if (cat) {
				const refs: { [key: string]: boolean } = { }

				cat.supportingEvidence.filter((ev) => ev.type !== SupportingEvidenceType.CALL).forEach((evidence) => {
					refs[evidence._id] = false
				})

				return {
					...prevState,
					supportingEvidenceRefs: refs,
					category: cat,
					init: false
				}
			}
		}

		return prevState
	}

	constructor (props: Props) {
		super(props)

		this.state = {
			supportingEvidenceRefs: { },
			values: { },
			init: true,
			error: '',
			valid: false
		}

		this.setFormFieldValid = this.setFormFieldValid.bind(this)
		this.setFormFieldInvalid = this.setFormFieldInvalid.bind(this)
		this.fileUploaded = this.fileUploaded.bind(this)
		this.setFormFieldValue = this.setFormFieldValue.bind(this)
	}

	public render () {
		if (this.props.loading) return <div></div>
		return this.renderEntryForm(this.props.categoryId)
	}

	private renderEntryForm (categoryId: string) {
		const category = this.props.categories ? this.props.categories.find((c) => c._id === categoryId) : undefined

		if (!category) {
			return (<div>Unknown category. <Link to='/submit' >Back to safety</Link></div>)
		}
		return (
			<div>
				<Button type='link' onClick={ () => this.props.history.push(`/submit/${this.props.awardId}`) }>
					Back To List
				</Button>
				<h1>{ category.name }</h1>
				<form encType='multipart/form-data' onSubmit={ this.handleSubmit.bind(this) }>
					{ category.supportingEvidence.map((evidence) => this.renderSupportingEvidence(evidence) ) }
					<input type='submit' value='Submit' disabled={ !this.state.valid }></input> { this.state.error }
				</form>
			</div>
		)
	}

	private handleSubmit (event: FormEvent) {
		event.preventDefault()

		this.callSubmit().then(() => {

			this.props.history.push(`/submit/${this.props.awardId}`)
		}).catch((error: Meteor.Error) => {
			if (error) {
				this.setState({
					error: error.error.toString()
				})
			}
		})
	}

	private async callSubmit (): Promise<boolean> {
		const values = this.state.values
		return new Promise((resolve, reject) => {
			Meteor.call(
				'submission.submit',
				JSON.parse(JSON.stringify(values)),
				this.props.categoryId,
				(error: string, result: boolean) => {
					if (error) reject(error)
					resolve(result)
				}
			)
		})
	}

	private formIsValid () {
		let valid = true

		for (const key in this.state.supportingEvidenceRefs) {
			if(!this.state.supportingEvidenceRefs[key]) {
				valid = false
			}
		}

		this.setState({
			valid
		})
	}

	private setFormFieldValid (uuid: any) {
		this.setState({
			supportingEvidenceRefs: { ...this.state.supportingEvidenceRefs, ...{ [uuid]: true }}
		})

		this.formIsValid()
	}

	private setFormFieldInvalid (uuid: any) {
		this.setState({
			supportingEvidenceRefs: { ...this.state.supportingEvidenceRefs, ...{ [uuid]: false }}
		})

		this.formIsValid()
	}

	private fileUploaded (uuid: any, fileId: string) {
		this.setFormFieldValid(uuid)
		this.setFormFieldValue(uuid, fileId)
	}

	private setFormFieldValue (uuid: any, value: string) {
		this.setState({
			values: { ...this.state.values, ...{ [uuid]: value } }
		})
	}

	private renderSupportingEvidence (evidence: SupportingEvidence) {
		switch (evidence.type) {
			case SupportingEvidenceType.VIDEO:
				return (
					<div>
						<h3>
							Video{ evidence.minLength || evidence.maxLength ? ' |' : undefined }
							{ evidence.minLength ? ` Min length: ${this.millisToMinutes(evidence.minLength)} minutes` : undefined }
							{ evidence.maxLength ? ` Max length: ${this.millisToMinutes(evidence.maxLength)} minutes` : undefined }
						</h3>
						<Upload
							onUpload={ this.setFormFieldValid }
							uuid={ evidence._id }
							format='video/mp4'
							onChange={ this.setFormFieldValue }
							categoryName={ this.state.category ? this.state.category.name : '' }
							stationName={ this.props.userStation ? this.props.userStation.name : '' }
						/>
					</div>
				)
			case SupportingEvidenceType.TEXT:
				return (
					<TextInput
						maxWords={ evidence.maxLength }
						uuid={ evidence._id }
						onValid={ this.setFormFieldValid }
						onInvalid={ this.setFormFieldInvalid }
						onChange={ this.setFormFieldValue }
					/>
				)
			case SupportingEvidenceType.PDF:
				return (
					<div>
						<h3>
							PDF{ evidence.minLength || evidence.maxLength ? ' |' : undefined }
							{ evidence.minLength ? ` Min length: ${evidence.minLength}` : undefined }
							{ evidence.maxLength ? ` Max length: ${evidence.maxLength}` : undefined }
						</h3>
						<Upload
							onUpload={ this.setFormFieldValid }
							uuid={ evidence._id }
							format='application/pdf'
							onChange={ this.setFormFieldValue }
							categoryName={ this.state.category ? this.state.category.name : '' }
							stationName={ this.props.userStation ? this.props.userStation.name : '' }
						/>
					</div>
				)
			case SupportingEvidenceType.CALL:
				return (
					<div className='videoCall'>
						A video call will be required as evidence for this entry. This will be arranged after submissions close.
					</div>
				)
		}
	}

	private millisToMinutes (millis: number): number {
		return millis / MINUTE
	}
}

export default withTracker((props: Props): Props => {
	const handles = [
		Meteor.subscribe(Collections.CATEGORIES),
		Meteor.subscribe(Collections.ENTRIES),
		Meteor.subscribe('users')
	]

	const loading = handles.some((handle) => !handle.ready())

	return {
		...props,
		loading,
		categories: Categories.find().fetch(),
		entries: Entries.find().fetch(),
		userStation: Stations.find({ authorizedUsers: Meteor.userId() || '_' }).fetch()[0]
	}
})(withRouter(Submit) as any)
