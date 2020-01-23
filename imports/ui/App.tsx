import { Button } from 'antd'
import history from 'history'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Route, Router, Switch } from 'react-router'
import { Link } from 'react-router-dom'
import { Roles } from '../api/helpers/enums'
import { GetDefaultRoute } from './DefaultRoute'
import Judge from './Judge'
import JudgeCategoriesList from './JudgeCategoriesList'
import JudgeCategory from './JudgeCategory'
import { Manage } from './manage/Manage'
import ManageStations from './manage/Stations'
import ManageUsers from './manage/Users'
import ResetPassword from './ResetPassword'
import { SignIn } from './SignIn'
import Submit from './submit/Submit'
import SubmitListAwards from './submit/SubmitListAwards'
import SubmitListCategories from './submit/SubmitListCategories'
import { WithAuth } from './WithAuth'
import '/imports/ui/css/App.css'

export interface AppProps {
	loading: boolean
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
					Meteor.userId() ?
					<Button type='link' onClick={ () => this.logoutUser() } style={ { float: 'right'} }>Logout</Button> :
					undefined
				}
				{
					<Router history={ browserHistory }>
						<Switch>
							<Route exact path='/signin' component={ SignIn } />
							<Route exact path='/' render={
								() => WithAuth(
									GetDefaultRoute()
								)
							} />
							<Route exact path='/enroll-account/:token' render={
								(props) => <ResetPassword token={ props.match.params.token } />
							}/>
							<Route exact path='/submit' render={
								() => WithAuth(<SubmitListAwards />)
							} />
							<Route exact path='/submit/:awardId' render={
								(props) => WithAuth(<SubmitListCategories awardId={ props.match.params.awardId } { ...props } />)
							} />
							<Route exact path='/submit/:awardId/:categoryId' render={
								(props) => WithAuth(
									<Submit awardId={ props.match.params.awardId } categoryId={ props.match.params.categoryId } { ...props } />
								)
							} />
							<Route exact path='/judge' render={
								(props) => WithAuth(
									<JudgeCategoriesList { ...props }  />,
									[Roles.ADMIN, Roles.JUDGE, Roles.HOST]
								)
							} />
							<Route exact path='/judge/:categoryId' render={
								(props) => WithAuth(
									<Judge { ...props } />,
									[Roles.ADMIN, Roles.JUDGE, Roles.HOST]
								)
							} />
							{ /* TODO: swap stationId and categoryId */ }
							<Route exact path='/judge/:stationId/:categoryId' render={
								(props) => WithAuth(
									<JudgeCategory
										stationId={ props.match.params.stationId }
										categoryId={ props.match.params.categoryId }
										{ ...props }
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

	private logoutUser () {
		Meteor.logout(((error) => {
			if (!error) setTimeout(() => document.location.reload(true), 1000)
		}))
	}
}

export default withTracker(() => {
	const handles = [
		Meteor.subscribe('users')
	]

	const loading = handles.some((handle) => !handle.ready())

	return {
		loading
	}
})(App as any)
