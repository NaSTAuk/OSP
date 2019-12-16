import React, { Component, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Award } from '../api/awards'
import { Category } from '../api/categories'
import { SupportingEvidenceType } from '../api/enums'
import { SupportingEvidence } from '../api/supporting-evidence'

export interface SubmitProperties {
	awards: Award[]
	categories: Category[]
	awardId?: string
	categoryId?: string
}

/** Creates a menu of awards open for submission */
export class Submit extends Component<SubmitProperties> {
	constructor (props: SubmitProperties) {
		super(props)
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

	private renderAwards () {
		return this.props.awards.filter((award) => award.active).map((award) => {
			return (
				<li key={ award._id }>
					<Link to={ (location) => `${location.pathname}/${award._id}` }>{ award.name }</Link>
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
				return (<li><Link to={ (location) => `${location.pathname}/${category._id}` }>{ category.name }</Link></li>)
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
				<form onSubmit={ this.handleSubmit.bind(this) }>
					{ category.supportingEvidence.map((evidence) => this.renderSupportingEvidence(evidence) ) }
					<input type='submit' value='Enter'></input>
				</form>
			</div>
		)
	}

	private handleSubmit (event: FormEvent) {
		event.preventDefault()
	}

	private renderSupportingEvidence (evidence: SupportingEvidence) {
		switch (evidence.type) {
			case SupportingEvidenceType.VIDEO:
				return (<input type='text' placeholder='Video'></input>)
			case SupportingEvidenceType.TEXT:
				return (<input type='text' placeholder='Text'></input>)
			case SupportingEvidenceType.PDF:
				return (<input type='text' placeholder='PDF'></input>)
			case SupportingEvidenceType.CALL:
				return <div>A video call will be required as evidence for this entry.</div>
		}
	}

	private getRefForSupportingEvidence () {

	}
}
