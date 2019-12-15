import history from 'history'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Route, Router, Switch } from 'react-router'
import { Award, Awards } from '../api/awards'
import { Categories, Category } from '../api/categories'
import { Collections } from '../api/enums'
import { AwardsList } from './AwardsList'
import { CreateAccount } from './CreateAccount'
import { SignIn } from './SignIn'

export interface AppProps {
	awards: Award[]
	categories: Category[]
}

const browserHistory = history.createBrowserHistory()

/** App */
class App extends Component<AppProps> {
	constructor (props: AppProps) {
		super (props)
	}

	/** Render */
	public render () {
		return (
			<div>
				<CreateAccount />
				{
					Meteor.userId() ?
					<Router history={ browserHistory }>
						<Switch>
							<Route exact path='/' render={
								() => <AwardsList awards={ this.props.awards} categories={ this.props.categories} />
							} />
						</Switch>
					</Router>:
					<SignIn />
				}

			</div>
		)
	}
}

export default withTracker(() => {
	Meteor.subscribe(Collections.AWARDS)
	Meteor.subscribe(Collections.CATEGORIES)

	return {
		awards: Awards.find().fetch(),
		categories: Categories.find().fetch()
	}
})(App as any)
