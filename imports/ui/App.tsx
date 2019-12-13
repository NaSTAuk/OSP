import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Award, Awards } from '../api/awards'
import { Categories, Category } from '../api/categories'

interface AppProps {
	awards: Award[]
	categories: Category[]
}

/** App */
class App extends Component<AppProps> {
	constructor (props: AppProps) {
		super (props)
	}

	/** Render */
	public render () {
		return (
			<div>
				<h1>Awards in System</h1>
				{ this.renderAwards() }
			</div>
		)
	}

	private renderAwards () {
		return this.props.awards.map((award) => {
			return (<div>
				<h4>{ award.name }</h4>
				<ul>
					{ this.renderCategories(award) }
				</ul>
			</div>)
		})
	}

	private renderCategories (award: Award) {
		return this.props.categories
			.filter((category) => category._id && award.categories.indexOf(category._id) !== -1)
			.map((category) => {
				return (
					<li>{ category.name }</li>
				)
			})
	}
}

export default withTracker(() => {
	return {
		awards: Awards.find().fetch(),
		categories: Categories.find().fetch()
	}
})(App as any)
