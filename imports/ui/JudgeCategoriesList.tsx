import { List } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Redirect, RouteComponentProps, withRouter } from 'react-router'
import { NaSTAUser } from '../api/accounts'
import { Categories, Category } from '../api/categories'
import { Collections, Roles } from '../api/helpers/enums'
import { JudgeToCategory } from '../api/judgeToCategory'
import { Link } from 'react-router-dom'

interface Props extends RouteComponentProps {
	loading?: boolean
	categories?: Category[]
}

class JudgeCategoriesList extends Component<Props> {
	public render () {
		if (this.props.loading) return <div></div>
		if (this.props.categories && this.props.categories.length && this.props.categories.length === 1) {
			return <Redirect to={ `/judge/${this.props.categories[0]._id}`} />
		}
		return (
			<div key='categoriesList'>
				<Link to='/'>Back</Link>
				{ this.renderCategories() }
			</div>
		)
	}

	private renderCategories () {
		return (
			<div className='judge'>
				<h1>
					Categories available for judging
				</h1>
				<List
					itemLayout='horizontal'
					dataSource={ this.props.categories }
					renderItem={ (category) => this.renderCategory(category)}
					className='list'
				>

				</List>
			</div>
		)
	}

	private renderCategory (category: Category) {
		return (
			<List.Item key={ category._id} className='item' onClick={ () => { this.goToCategoryPage(category._id) }} >
				<b>{ category.name }</b>
			</List.Item>
		)
	}

	private goToCategoryPage (categoryId?: string) {
		if (!categoryId) return

		this.props.history.push(`/judge/${categoryId}`)
	}
}

export default withTracker((props: Props) => {
	const handles = [
		Meteor.subscribe(Collections.CATEGORIES),
		Meteor.subscribe(Collections.JudgeToCategory),
		Meteor.subscribe('users')
	]

	const user = Meteor.user() as NaSTAUser

	if (!user) return props

	if (!user.roles.includes(Roles.JUDGE)) return props

	const judgeToCat = JudgeToCategory.find({ judgeId: user._id })

	if (!judgeToCat) return props

	const categories: Category[] = []

	judgeToCat.forEach((catId) => {
		const category = Categories.findOne({ _id: catId.categoryId })

		if (category) categories.push(category)
	})

	const loading = handles.some((handle) => !handle.ready())

	return {
		...props,
		loading,
		categories
 	}
})(withRouter(JudgeCategoriesList) as any)
