import React, { Component, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Award } from '../api/awards'
import { Category } from '../api/categories'
import { MINUTE } from '../api/constants'
import { SupportingEvidenceType } from '../api/enums'
import { SupportingEvidence } from '../api/supporting-evidence'
import { Upload } from './elements/Upload'
import { TextInput } from './TextInput'

import '/imports/ui/css/Submit.css'

export interface SubmitProperties {
	awards: Award[]
	categories: Category[]
	awardId?: string
	categoryId?: string
}

interface State {
	supportingEvidenceRefs: { [key: string]: boolean }
}

/** Creates a menu of awards open for submission */
export class Submit extends Component<SubmitProperties, State> {
	constructor (props: SubmitProperties) {
		super(props)

		this.state = {
			supportingEvidenceRefs: { }
		}

		this.setFormFieldValid = this.setFormFieldValid.bind(this)
		this.setFormFieldInvalid = this.setFormFieldInvalid.bind(this)
	}

	public componentDidMount () {
		setTimeout(() => this.setStateRefs(), 1000)
	}

	public render () {
		if (this.props.awardId) {
			if (this.props.categoryId) {
				return this.renderEntryForm(this.props.categoryId)
			} else {
				return (
					<div>
						<ul>
							{ this.renderCategories(this.props.awardId) }
						</ul>
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

	private setStateRefs () {
		const category = this.props.categories.find((c) => c._id === this.props.categoryId)

		if (category) {
			const refs: { [key: string]: boolean } = { }

			category.supportingEvidence.filter((ev) => ev.type !== SupportingEvidenceType.CALL).forEach((evidence) => {
				refs[evidence._id] = false
			})

			this.setState({
				supportingEvidenceRefs: refs
			})
		}

		// this.forceUpdate()
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
					<li>
						<Link to={ (location) => `${location.pathname.replace(/\/$/,'')}/${category._id}` }>{ category.name }</Link>
					</li>
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
					<input type='submit' value='Submit' disabled={ !this.formIsValid() }></input>
				</form>
			</div>
		)
	}

	private handleSubmit (event: FormEvent) {
		event.preventDefault()
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
						<Upload onUpload={ this.setFormFieldValid } uuid={ evidence._id } format='video/mp4' />
					</div>
				)
			case SupportingEvidenceType.TEXT:
				return (
					<TextInput
						maxWords={ evidence.maxLength }
						uuid={ evidence._id }
						onValid={ this.setFormFieldValid }
						onInvalid={ this.setFormFieldInvalid}
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
						<Upload onUpload={ this.setFormFieldValid } uuid={ evidence._id } format='application/pdf' />
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
