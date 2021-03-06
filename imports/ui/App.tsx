import { Button, notification } from 'antd'
import history from 'history'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Redirect, Route, Router, Switch } from 'react-router-dom'
import { Collections, Roles } from '../api/helpers/enums'
import { System, SystemProps } from '../api/system'
import RequestPasswordReset from './auth/RequestPasswordReset'
import ResetPassword from './auth/ResetPassword'
import { SignIn } from './auth/SignIn'
import { GetDefaultRoute } from './DefaultRoute'
import Hosts from './hosts/Hosts'
import Judge from './judge/Judge'
import JudgeCategoriesList from './judge/JudgeCategoriesList'
import JudgeCategory from './judge/JudgeEntry'
import JudgeRankEntries from './judge/JudgeRankEntries'
import ManageAwards from './manage/Awards'
import ManageJudges from './manage/Judges'
import { Manage } from './manage/Manage'
import ManageStations from './manage/Stations'
import ManageUsers from './manage/Users'
import Submit from './submit/Submit'
import SubmitListAwards from './submit/SubmitListAwards'
import SubmitListCategories from './submit/SubmitListCategories'
import VideosPage from './Videos'
import { WithAuth } from './WithAuth'
import '/imports/ui/css/App.css'

export interface AppProps {
	loading: boolean
	system?: SystemProps
}

export interface State {
	messageSent: boolean
}

const browserHistory = history.createBrowserHistory()

/** App */
class App extends Component<AppProps, State> {
	public static getDerivedStateFromProps(nextProps: AppProps, prevState: State): State {
		if (!Meteor.userId()) {
			return {
				...prevState,
				messageSent: true,
			}
		}

		if (nextProps.system && nextProps.system.messages && Meteor.userId()) {
			nextProps.system.messages.forEach((message) => {
				notification.info({
					message,
				})
			})

			return {
				...prevState,
				messageSent: true,
			}
		}

		return prevState
	}
	constructor(props: AppProps) {
		super(props)

		this.state = {
			messageSent: false,
		}
	}

	public shouldComponentUpdate(nextProps: AppProps, _nextState: any) {
		return !nextProps.loading
	}

	/** Render */
	public render() {
		if (Meteor.userId() && this.props.loading) return <div></div>
		return (
			<div className={Meteor.userId() ? 'container' : ''}>
				{Meteor.userId() ? (
					<Button type="link" onClick={() => this.logoutUser()} style={{ float: 'right' }}>
						Logout
					</Button>
				) : undefined}
				{
					<Router history={browserHistory}>
						<Switch>
							<Route exact path="/signin" component={SignIn} />
							<Route exact path="/resetredirect">
								<Redirect to="/" />
							</Route>
							<Route exact path="/forgotpassword" render={(props) => <RequestPasswordReset {...props} />} />
							<Route exact path="/" render={() => WithAuth(GetDefaultRoute())} />
							<Route
								exact
								path="/enroll-account/:token"
								render={(props) => <ResetPassword token={props.match.params.token} />}
							/>
							<Route
								exact
								path="/reset-password/:token"
								render={(props) => <ResetPassword token={props.match.params.token} />}
							/>
							<Route
								exact
								path="/reset-password/:token"
								render={(props) => <ResetPassword token={props.match.params.token} />}
							/>
							<Route exact path="/submit" render={() => WithAuth(<SubmitListAwards />)} />
							<Route
								exact
								path="/submit/:awardId"
								render={(props) =>
									WithAuth(<SubmitListCategories review={false} awardId={props.match.params.awardId} {...props} />)
								}
							/>
							<Route
								exact
								path="/review/:awardId"
								render={(props) =>
									WithAuth(<SubmitListCategories review={true} awardId={props.match.params.awardId} {...props} />)
								}
							/>
							<Route
								exact
								path="/submit/:awardId/:categoryId"
								render={(props) =>
									WithAuth(
										<Submit
											awardId={props.match.params.awardId}
											categoryId={props.match.params.categoryId}
											{...props}
										/>
									)
								}
							/>
							<Route
								exact
								path="/judge"
								render={(props) => WithAuth(<JudgeCategoriesList {...props} />, [Roles.ADMIN, Roles.JUDGE, Roles.HOST])}
							/>
							<Route
								exact
								path="/judge/rank/:categoryId"
								render={(props) =>
									WithAuth(<JudgeRankEntries categoryId={props.match.params.categoryId} {...props} />, [
										Roles.ADMIN,
										Roles.JUDGE,
										Roles.HOST,
									])
								}
							/>
							<Route
								exact
								path="/judge/:categoryId"
								render={(props) =>
									WithAuth(<Judge categoryId={props.match.params.categoryId} {...props} />, [
										Roles.ADMIN,
										Roles.JUDGE,
										Roles.HOST,
									])
								}
							/>
							{/* TODO: swap stationId and categoryId */}
							<Route
								exact
								path="/judge/:stationId/:categoryId"
								render={(props) =>
									WithAuth(
										<JudgeCategory
											stationId={props.match.params.stationId}
											categoryId={props.match.params.categoryId}
											{...props}
										/>,
										[Roles.ADMIN, Roles.JUDGE, Roles.HOST]
									)
								}
							/>
							<Route exact path="/hosts" render={() => WithAuth(<Hosts />, [Roles.ADMIN, Roles.HOST])} />
							<Route
								exact
								path="/hosts/videos"
								render={() => WithAuth(<VideosPage />, [Roles.ADMIN, Roles.HOST, Roles.EDITOR])}
							/>
							<Route exact path="/manage" render={(props) => WithAuth(<Manage {...props} />, [Roles.ADMIN])} />
							<Route
								exact
								path="/manage/users"
								render={(props) => WithAuth(<ManageUsers {...props} />, [Roles.ADMIN])}
							/>
							<Route exact path="/manage/stations" render={() => WithAuth(<ManageStations />, [Roles.ADMIN])} />
							<Route
								exact
								path="/manage/judges"
								render={(props) => WithAuth(<ManageJudges {...props} />, [Roles.ADMIN])}
							/>
							<Route
								exact
								path="/manage/awards"
								render={(props) => WithAuth(<ManageAwards {...props} />, [Roles.ADMIN])}
							/>
						</Switch>
					</Router>
				}
			</div>
		)
	}

	private logoutUser() {
		Meteor.logout((error) => {
			if (!error) setTimeout(() => document.location.replace('/'), 1000)
		})
	}
}

export default withTracker(() => {
	const handles = [Meteor.subscribe('users'), Meteor.subscribe(Collections.SYSTEM)]

	const loading = handles.some((handle) => !handle.ready())

	return {
		loading,
		system: System.findOne({}),
	}
})(App as any)
