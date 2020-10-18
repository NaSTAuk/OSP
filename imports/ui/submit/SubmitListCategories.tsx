import { Button, Drawer, List, Tag } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import { Award, Awards } from '../../api/awards'
import { Categories, Category } from '../../api/categories'
import { Entries, Entry } from '../../api/entries'
import { Collections } from '../../api/helpers/enums'
import { Station, Stations } from '../../api/stations'
import { TechSpecIssuesList } from '../elements/TechSpecFailures'
import { TechSpecsBadge } from '../elements/TechSpecsBadge'
import { VerificationBadge } from '../elements/VerificationBadge'
import { SupportingEvidenceList } from '../judge/SupportingEvidenceList'
import { Evidence, EvidenceCollection } from '/imports/api/evidence'

interface Props extends RouteComponentProps {
	loading?: boolean,
	awardId: string,
	award?: Award
	categories?: Category[]
	entries?: Entry[]
	userStation?: Station
	review: boolean
}

interface State {
	init: boolean
	awardsEntered: string[]
	drawerVisible: boolean
	activeEntry?: Entry
}

class SubmitListCategories extends Component<Props, State> {

	public static getDerivedStateFromProps (nextProps: Props, prevState: State): State {
		if (prevState.init && nextProps.userStation && !nextProps.loading) {
			const entered: string[] = []

			if (!nextProps.categories) return prevState
			nextProps.categories.forEach((category) => {
				if (category._id) {
					const entry = nextProps.entries ? nextProps.entries.find(
						(ent) => {
							return ent.categoryId === category._id && nextProps.userStation && ent.stationId === nextProps.userStation._id
						}
					) : undefined

					if (entry) {
						entered.push(category._id)
					}
				}
			})

			return {
				...prevState,
				awardsEntered: entered,
				init: false
			}
		}

		return prevState
	}

	constructor (props: Props) {
		super(props)

		this.state = {
			init: true,
			awardsEntered: [],
			drawerVisible:  false
		}
	}

	public render () {
		if (this.props.loading || this.state.init) return <div></div>
		return (
			<div className='submit'>
				<Button type='link' onClick={ () => this.props.history.push(`/submit`) }>
					Back To Awards
				</Button>
				{
					!this.props.review ?
					<h1>Categories open for entry</h1> :
					<h1>Review Your Entries</h1>
				}
				{ this.renderCategories() }
				<Drawer
					title={ 'Entry Details' }
					placement='right'
					width={ '50%' }
					closable={ true }
					visible={ this.state.drawerVisible }
					onClose={ () => this.drawerClosed() }
				>
					{ this.renderDrawer() }
				</Drawer>
			</div>
		)
	}

	private renderCategories () {
		if (!this.props.award || !this.props.categories) {
			return (<div>Unknown award. <Link to='/submit' >Back to safety</Link></div>)
		}

		return (
			<List
				itemLayout='horizontal'
				dataSource={ this.props.categories.sort((a, b) => a.name.localeCompare(b.name)) }
				renderItem={ (category) => this.renderCategory(this.props.award!, category)}
				className='list'
			>

			</List>
		)
	}

	private renderCategory (award: Award, category: Category) {
		if (!this.props.userStation) return <div></div>
		const entry = Entries.findOne({
			stationId: this.props.userStation._id,
			categoryId: category._id
		}, { sort: { date: -1 } })
		return (
			<List.Item
				key={ category._id} className='item interactive'
				onClick={ () => this.categoryClicked(award, category) }
			>
				<div style={ { width: '100%', minWidth: '100%' } }>
					<b>{ category.name }</b>
					<span style={ { float: 'right' } }>
						{
							this.props.review && entry ?
							<React.Fragment>
								<TechSpecsBadge entry={ entry } />
								<VerificationBadge entry={ entry } />
							</React.Fragment>
							: undefined
						}
						{
							category._id ? this.state.awardsEntered.includes(category._id) ?
							<Tag color='green'>Entered</Tag> : <Tag color='red'>Not Entered</Tag> : <Tag>Unknown</Tag>
						}
					</span>
				</div>
			</List.Item>
		)
	}

	private renderDrawer () {
		if (!this.state.activeEntry) return <div></div>
		const evidence: Evidence[] = []
		this.state.activeEntry.evidenceIds.forEach((id) => {
			const ev = EvidenceCollection.findOne({ _id: id })

			if (ev) evidence.push(ev)
		})

		const category = Categories.findOne({ _id: this.state.activeEntry.categoryId })

		if (!category) return <div></div>

		if (!category.openForReview) {
			return (
				<React.Fragment>
					<p>
						This category is still under review, check back soon!
					</p>
				</React.Fragment>
			)
		}

		return (
			<React.Fragment>
				<h1>Your Entry</h1>
				<SupportingEvidenceList evidence={ evidence } />
				{
					this.state.activeEntry.techSpecFailures ?
					<TechSpecIssuesList failures={ this.state.activeEntry.techSpecFailures } /> : undefined
				}
				{
					this.state.activeEntry.comments ?
					<React.Fragment>
						<h1>Comments From Hosts</h1>
						{
							this.state.activeEntry.comments
						}
					</React.Fragment> : undefined
				}
			</React.Fragment>
		)
	}

	private categoryClicked (award: Award, category: Category) {
		if (!this.props.review) {
			this.props.history.push(`/submit/${award._id}/${category._id}`)
		} else {
			const entry = Entries.findOne({
				stationId: this.props.userStation ? this.props.userStation._id : undefined,
				categoryId: category._id
			}, { sort: { date: -1 } })

			if (entry) {
				this.setState({
					drawerVisible: true,
					activeEntry: entry
				})
			}
		}
	}

	private drawerClosed () {
		this.setState({
			drawerVisible: false,
			activeEntry: undefined
		})
	}
}

export default withTracker((props: Props) => {
	const handles = [
		Meteor.subscribe(Collections.AWARDS),
		Meteor.subscribe(Collections.CATEGORIES),
		Meteor.subscribe(Collections.STATIONS),
		Meteor.subscribe(Collections.ENTRIES),
		Meteor.subscribe(Collections.EVIDENCE),
		Meteor.subscribe('users')
	]

	const award = Awards.findOne({ _id: props.awardId })

	let categories: Category[] = []

	if (award) {
		categories = Categories.find({ forAwards: award.name }).fetch()
	}

	const loading = handles.some((handle) => !handle.ready())

	return {
		loading,
		awardId: props.awardId,
		award,
		categories,
		entries: Entries.find().fetch(),
		userStation: Stations.find({ authorizedUsers: Meteor.userId() || '_' }).fetch()[0]
	}
})(withRouter(SubmitListCategories) as any)
