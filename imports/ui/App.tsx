import history from 'history'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Route, Router, Switch } from 'react-router'
import { Award, Awards } from '../api/awards'
import { Categories, Category } from '../api/categories'
import { Collections, Roles } from '../api/helpers/enums'
import { AwardsList } from './AwardsList'
import { SignIn } from './SignIn'
import { Submit } from './Submit'
import { WithAuth } from './WithAuth'

import { Entries, Entry } from '../api/entries'
import { Station, Stations } from '../api/stations'
import Judge from './Judge'
import JudgeCategory from './JudgeCategory'
import { Manage } from './manage/Manage'
import ManageStations from './manage/Stations'
import ManageUsers from './manage/Users'
import '/imports/ui/css/App.css'

export interface AppProps {
	loading: boolean
	awards: Award[]
	categories: Category[]
	stations: Station[]
	entries: Entry[]
	userStation?: Station
}

const browserHistory = history.createBrowserHistory()

/** App */
class App extends Component<AppProps> {
	constructor (props: AppProps) {
		super (props)
	}

	public shouldComponentUpdate (nextProps: AppProps, _nextState: any) {
		return !nextProps.loading
	}

	/** Render */
	public render () {
		if (Meteor.userId() && this.props.loading) return <div></div>
		return (
			<div>
				{
					<Router history={ browserHistory }>
						<Switch>
							<Route exact path='/signin' component={ SignIn } />{ /* TODO: Redirect */ }
							<Route exact path='/' render={
								() => WithAuth(
									<AwardsList
										awards={ this.props.awards }
										categories={ this.props.categories }
										stations={ this.props.stations }
										entries={ this.props.entries }
										userStation={ this.props.userStation }
										loading={ this.props.loading }
									/>
								)
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
							<Route exact path='/judge' render={
								() => WithAuth(
									<Judge />,
									[Roles.ADMIN, Roles.JUDGE, Roles.HOST]
								)
							} />
							<Route exact path='/judge/:stationId/:categoryId' render={
								(props) => WithAuth(
									<JudgeCategory
										stationId={ props.match.params.stationId }
										categoryId={ props.match.params.categoryId }
									/>,
									[Roles.ADMIN, Roles.JUDGE, Roles.HOST]
								)
							} />
							<Route exact path='/manage' render={
								() => WithAuth(
									<Manage />,
									[Roles.ADMIN]
								)
							} />
							<Route exact path='/manage/users' render={
								() => WithAuth(
									<ManageUsers />,
									[Roles.ADMIN]
								)
							} />
							<Route exact path='/manage/stations' render={
								() => WithAuth(
									<ManageStations />,
									[Roles.ADMIN]
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
})(App as any)
