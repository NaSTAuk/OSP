import React, { Component } from 'react'
import { Award } from '../api/awards'
import { AppProps } from './App'

/** Renders a list of registered awards in the system. */
export class AwardsList extends Component<AppProps> {
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
					<li key={ category._id }>{ category.name }</li>
				)
			})
	}
}
