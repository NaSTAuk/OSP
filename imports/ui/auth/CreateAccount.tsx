import { Meteor } from 'meteor/meteor'
import React, { Component, FormEvent } from 'react'
import ReactDOM from 'react-dom'

/** UI for creating user accounts */
export class CreateAccount extends Component {
	public render() {
		return (
			<div>
				<h1>Create Account</h1>

				<form onSubmit={this.handleSubmit.bind(this)}>
					<input type="email" ref="emailInput" placeholder="Email" />
				</form>
			</div>
		)
	}

	private handleSubmit(event: FormEvent) {
		event.preventDefault()
		const email = (ReactDOM.findDOMNode(this.refs.emailInput) as HTMLInputElement).value.trim()

		Meteor.call('accounts.create', email, '1234')

		;(ReactDOM.findDOMNode(this.refs.emailInput) as HTMLInputElement).value = ''
	}
}
