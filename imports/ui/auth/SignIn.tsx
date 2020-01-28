import { Meteor } from 'meteor/meteor'
import React, { Component, FormEvent } from 'react'
import ReactDOM from 'react-dom'

/** Login UI */
export class SignIn extends Component {
	public render () {
		return (
			<div>
				<h1>Sign in</h1>
				<form onSubmit={ this.handleSubmit.bind(this) }>
					<input type='email' ref='emailInput' placeholder='Email' />
					<input type='password' ref='passwordInput' placeholder='Password' />
					<input type='submit' value='Login'></input>
				</form>
			</div>
		)
	}

	private handleSubmit (event: FormEvent) {
		event.preventDefault()
		const email = (ReactDOM.findDOMNode(this.refs.emailInput) as HTMLInputElement).value.trim()
		const password = (ReactDOM.findDOMNode(this.refs.passwordInput) as HTMLInputElement).value.trim()
		Meteor.loginWithPassword(email, password);
		(ReactDOM.findDOMNode(this.refs.emailInput) as HTMLInputElement).value = '';
		(ReactDOM.findDOMNode(this.refs.passwordInput) as HTMLInputElement).value = ''
		setTimeout(() => document.location.reload(true), 1000)
	}
}
