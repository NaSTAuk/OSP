import { Button, Form, Icon, Modal } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component, FormEvent } from 'react'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import { Categories, Category } from '../../api/categories'
import { Entries, Entry } from '../../api/entries'
import { MINUTE } from '../../api/helpers/constants'
import { Collections, DEFAULT_CATEGORY_NAMES, SupportingEvidenceType } from '../../api/helpers/enums'
import { Station, Stations } from '../../api/stations'
import { SupportingEvidence } from '../../api/supporting-evidence'
import { TextInput } from '../elements/TextInput'
import { Upload } from '../elements/Upload'
import { Award, Awards } from '/imports/api/awards'
import '/imports/ui/css/Submit.css'

interface Props extends RouteComponentProps {
	loading?: boolean
	awardId: string
	categoryId: string
	userStation?: Station
	categories?: Category[]
	entries?: Entry[]
	award?: Award
}

interface State {
	supportingEvidenceRefs: { [key: string]: boolean }
	values: { [key: string]: string }
	init: boolean
	error: string
	category?: Category
	valid: boolean
	showRulesModal: boolean
	evidenceLinks: string
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

					if (evidence.type === SupportingEvidenceType.VIDEO) {
						refs[`${evidence._id}10Sec`] = false
					}
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
			valid: false,
			showRulesModal: false,
			evidenceLinks: ''
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
			<div className='mainContent'>
				<Button type='link' onClick={ () => this.props.history.push(`/submit/${this.props.awardId}`) }>
					Back To List
				</Button>
				<h1>{ category.name }</h1>
				<p>
					{ category.description }
				</p>
				<Form>
					{ category.supportingEvidence.map((evidence) => this.renderSupportingEvidence(evidence) ) }
					{
						category.supportingEvidence.some((evidence) => evidence.type === SupportingEvidenceType.VIDEO) &&
						this.props.award && this.props.award.name === 'NaSTA Awards' && !this.isSuperBlooper() ?
						<Form.Item>
							<p>
								Please provide links to all videos used in your entry below.
								<Icon
									key='rulesIcon'
									type='question-circle'
									theme='twoTone'
									onClick={ () => this.setState({ showRulesModal: true }) }
									style={ { marginLeft: '1%' } }
								/>
							</p>
							<Modal
								key='rulesModal'
								visible={ this.state.showRulesModal }
								title='Why we require links to video content'
								onOk={ () => this.handleRulesModalOk() }
								footer={ [
									<Button key='ok' type='primary' onClick={ () => this.handleRulesModalOk() }>
									OK
									</Button>
								]}
							>
								<p>
									We want to make sure that NaSTA is fair for everyone, as such we require that
									all content entered be published within the last year.
									There is, however, an allowance for 10% of content to be archive material.
								</p>
							</Modal>
							<TextArea
								key='linksTextarea'
								value={ this.state.evidenceLinks }
								rows={ 10 }
								placeholder='Video links'
								onChange={ (event) => this.evidenceLinksChange(event)}
							/>
						</Form.Item> :
						undefined
					}
					<Button
						key='submitButton'
						type='primary'
						disabled={ !this.state.valid }
						onClick={ (event) => this.handleSubmit(event) }
					>
						Submit
					</Button> { this.state.error }
				</Form>
			</div>
		)
	}

	private evidenceLinksChange (event: React.ChangeEvent<HTMLTextAreaElement>) {
		event.preventDefault()

		this.setState({
			evidenceLinks: event.target.value
		}, () => this.formIsValid())
	}

	private handleRulesModalOk () {
		this.setState({
			showRulesModal: false
		})
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
		const values = { ...this.state.values, LINKS: this.state.evidenceLinks }
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

		if (this.props.award && this.props.award.name === 'NaSTA Awards') {
			if (this.state.evidenceLinks.length < 10) {
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
		}, () => this.formIsValid())
	}

	private setFormFieldInvalid (uuid: any) {
		this.setState({
			supportingEvidenceRefs: { ...this.state.supportingEvidenceRefs, ...{ [uuid]: false }}
		}, () => this.formIsValid())
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

	private isSuperBlooper (): boolean {
		const category = Categories.findOne({ _id: this.props.categoryId })

		if (!category) return false

		return category.name === DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_SUPER_BLOOPER
	}

	private renderSupportingEvidence (evidence: SupportingEvidence) {
		switch (evidence.type) {
			case SupportingEvidenceType.VIDEO:
				return (
					<div key={ evidence._id }>
						<h3>
							Video{ evidence.minLength || evidence.maxLength ? ' |' : undefined }
							{ evidence.minLength ? ` Min length: ${this.millisToMinutes(evidence.minLength)} minutes` : undefined }
							{ evidence.maxLength ? ` Max length: ${this.millisToMinutes(evidence.maxLength)} minutes` : undefined }
						</h3>
						<p>
							{ evidence.description }
						</p>
						<Upload
							onUpload={ this.setFormFieldValid }
							uuid={ evidence._id }
							format='video/mp4'
							onChange={ this.setFormFieldValue }
							categoryName={ this.state.category ? this.state.category.name : '' }
							stationName={ this.props.userStation ? this.props.userStation.name : '' }
							key={ evidence._id }
						/>
						<h3>10 Second Clip of Entry</h3>
						<Upload
							onUpload={ this.setFormFieldValid }
							uuid={ `${evidence._id}10Sec` }
							format='video/mp4'
							onChange={ this.setFormFieldValue }
							categoryName={ this.state.category ? `${this.state.category.name}10Sec` : '10Sec' }
							stationName={ this.props.userStation ? this.props.userStation.name : '' }
							key={ `${evidence._id}10Sec` }
						/>
					</div>
				)
			case SupportingEvidenceType.TEXT:
				return (
					<React.Fragment>
						<TextInput
							maxWords={ evidence.maxLength }
							uuid={ evidence._id }
							onValid={ this.setFormFieldValid }
							onInvalid={ this.setFormFieldInvalid }
							onChange={ this.setFormFieldValue }
							key={ evidence._id }
						/>
						<p>
							{ evidence.description }
						</p>
					</React.Fragment>
				)
			case SupportingEvidenceType.PDF:
				return (
					<div key={ evidence._id }>
						<h3>
							PDF{ evidence.minLength || evidence.maxLength ? ' |' : undefined }
							{ evidence.minLength ? ` Min length: ${evidence.minLength}` : undefined }
							{ evidence.maxLength ? ` Max length: ${evidence.maxLength}` : undefined }
						</h3>
						<p>
							{ evidence.description }
						</p>
						<Upload
							onUpload={ this.setFormFieldValid }
							uuid={ evidence._id }
							format='application/pdf'
							onChange={ this.setFormFieldValue }
							categoryName={ this.state.category ? this.state.category.name : '' }
							stationName={ this.props.userStation ? this.props.userStation.name : '' }
							key={ evidence._id }
						/>
					</div>
				)
			case SupportingEvidenceType.CALL:
				return (
					<div className='videoCall' key={ evidence._id }>
						A video call will be required as evidence for this entry. This will be arranged after submissions close.
						{ evidence.description }
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
		Meteor.subscribe(Collections.AWARDS),
		Meteor.subscribe(Collections.STATIONS),
		Meteor.subscribe('users')
	]

	const loading = handles.some((handle) => !handle.ready())

	return {
		...props,
		loading,
		categories: Categories.find().fetch(),
		entries: Entries.find().fetch(),
		userStation: Stations.find({ authorizedUsers: Meteor.userId() || '_' }).fetch()[0],
		award: Awards.findOne({ _id: props.awardId })
	}
})(withRouter(Submit) as any)
