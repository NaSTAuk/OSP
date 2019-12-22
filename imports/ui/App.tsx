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
import { Submit } from './Submit'
import { WithAuth } from './WithAuth'

import '/imports/ui/css/App.css'

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
					<Router history={ browserHistory }>
						<Switch>
							<Route exact path='/signin' component={ SignIn } />{ /* TODO: Redirect */ }
							<Route exact path='/' render={
								() => WithAuth(<AwardsList awards={ this.props.awards} categories={ this.props.categories} />)
							} />
							<Route exact path='/submit' render={
								() => WithAuth(<Submit { ...this.props } />)
							} />
							<Route exact path='/submit/:awardId' render={
								(props) => WithAuth(<Submit awardId={ props.match.params.awardId } { ...this.props } />)
							} />
							<Route exact path='/submit/:awardId/:categoryId' render={
								(props) => WithAuth(
									<Submit
										awardId={ props.match.params.awardId }
										categoryId={ props.match.params.categoryId }
										{ ...this.props }
									/>
								)
							} />
						</Switch>
					</Router>
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
