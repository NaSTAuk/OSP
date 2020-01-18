import { Col, Row } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component, FormEvent } from 'react'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import { Award, Awards } from '../api/awards'
import { Categories, Category } from '../api/categories'
import { Entries, Entry } from '../api/entries'
import { MINUTE } from '../api/helpers/constants'
import { Collections, SupportingEvidenceType } from '../api/helpers/enums'
import { Station, Stations } from '../api/stations'
import { SupportingEvidence } from '../api/supporting-evidence'
import { Upload } from './elements/Upload'
import { TextInput } from './TextInput'
import '/imports/ui/css/Submit.css'

export interface SubmitProperties extends RouteComponentProps {
	loading: boolean
	awards: Award[]
	categories: Category[]
	entries: Entry[]
	awardId?: string
	categoryId?: string
	userStation?: Station
}

interface State {
	supportingEvidenceRefs: { [key: string]: boolean }
	values: { [key: string]: string }
	init: boolean
	awardsEntered: string[],
	error: string
	category?: Category
}

/** Creates a menu of awards open for submission */
class Submit extends Component<SubmitProperties, State> {

	public static getDerivedStateFromProps (nextProps: SubmitProperties, prevState: State): State {
		if (prevState.init && nextProps.userStation) {
			const entered: string[] = []
			nextProps.categories.forEach((category) => {
				if (category._id) {
					const entry = nextProps.entries.find(
						(ent) => {
							return ent.categoryId === category._id && nextProps.userStation && ent.stationId === nextProps.userStation._id
						}
					)

					if (entry) {
						entered.push(category._id)
					}
				}
			})

			const cat = nextProps.categories.find((c) => c._id === nextProps.categoryId)

			if (cat) {
				const refs: { [key: string]: boolean } = { }

				cat.supportingEvidence.filter((ev) => ev.type !== SupportingEvidenceType.CALL).forEach((evidence) => {
					refs[evidence._id] = false
				})

				return {
					...prevState,
					supportingEvidenceRefs: refs,
					awardsEntered: entered,
					category: cat,
					init: false
				}
			} else {
				return {
					...prevState,
					awardsEntered: entered,
					init: false
				}
			}
		}

		return prevState
	}

	constructor (props: SubmitProperties) {
		super(props)

		this.state = {
			supportingEvidenceRefs: { },
			values: { },
			init: true,
			awardsEntered: [],
			error: ''
		}

		this.setFormFieldValid = this.setFormFieldValid.bind(this)
		this.setFormFieldInvalid = this.setFormFieldInvalid.bind(this)
		this.fileUploaded = this.fileUploaded.bind(this)
		this.setFormFieldValue = this.setFormFieldValue.bind(this)
	}

	public render () {
		if (this.props.loading) return <div></div>
		if (this.props.awardId) {
			if (this.props.categoryId) {
				return this.renderEntryForm(this.props.categoryId)
			} else {
				return (
					<div>
						<h1>Categories open for entry</h1>
						{ this.renderCategories(this.props.awardId) }
					</div>
				)
			}
		} else {
			return (
				<div>
					<h1>Awards Open For Entry</h1>
					<ul>
						{ this.renderAwards() }
					</ul>
				</div>
			)
		}
	}

	private renderAwards () {
		return this.props.awards.filter((award) => award.active).map((award) => {
			return (
				<li key={ award._id }>
					<Link to={ (location) => `${location.pathname.replace(/\/$/,'')}/${award._id}` }>{ award.name }</Link>
				</li>
			)
		})
	}

	private renderCategories (awardId: string) {
		const award = this.props.awards.find((a) => a._id === awardId)

		if (!award) {
			return (<div>Unknown award. <Link to='/submit' >Back to safety</Link></div>)
		}

		return award.categories.map((categoryId) => {
			const category = this.props.categories.find((c) => c._id === categoryId)

			if (category) {
				return (
					<Row gutter={ [32, 4]} style={ { borderBottom: '1px solid black', width: '100%' }}>
						<Col span={ 10 }>
							<Link to={ (location) => `${location.pathname.replace(/\/$/,'')}/${category._id}` }>{ category.name }</Link>
						</Col>
						<Col span={ 14 }>
							{
								category._id ? this.state.awardsEntered.includes(category._id) ? 'Entered' : 'Not Entered' : 'nyet'
							}
						</Col>
					</Row>
				)
			}
		})
	}

	private renderEntryForm (categoryId: string) {
		const category = this.props.categories.find((c) => c._id === categoryId)

		if (!category) {
			return (<div>Unknown category. <Link to='/submit' >Back to safety</Link></div>)
		}
		return (
			<div>
				<h1>{ category.name }</h1>
				<form encType='multipart/form-data' onSubmit={ this.handleSubmit.bind(this) }>
					{ category.supportingEvidence.map((evidence) => this.renderSupportingEvidence(evidence) ) }
					<input type='submit' value='Submit' disabled={ !this.formIsValid() }></input> { this.state.error }
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

	private formIsValid (): boolean {
		let valid = true

		for (const key in this.state.supportingEvidenceRefs) {
			if(!this.state.supportingEvidenceRefs[key]) {
				valid = false
			}
		}

		return valid
	}

	private setFormFieldValid (uuid: any) {
		this.setState({
			supportingEvidenceRefs: { ...this.state.supportingEvidenceRefs, ...{ [uuid]: true }}
		})
	}

	private setFormFieldInvalid (uuid: any) {
		this.setState({
			supportingEvidenceRefs: { ...this.state.supportingEvidenceRefs, ...{ [uuid]: false }}
		})
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

export default withTracker(() => {
	const handles = [
		Meteor.subscribe(Collections.AWARDS),
		Meteor.subscribe(Collections.CATEGORIES),
		Meteor.subscribe(Collections.STATIONS),
		Meteor.subscribe(Collections.ENTRIES),
		Meteor.subscribe(Collections.JudgeToCategory),
		Meteor.subscribe('users')
	]

	const loading = handles.some((handle) => !handle.ready())

	return {
		loading,
		awards: Awards.find().fetch(),
		categories: Categories.find().fetch(),
		stations: Stations.find().fetch(),
		entries: Entries.find().fetch(),
		userStation: Stations.find({ authorizedUsers: Meteor.userId() || '_' }).fetch()[0]
	}
})(withRouter(Submit) as any)
