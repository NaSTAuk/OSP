import { Button, Form, Input } from 'antd'
import { Meteor } from 'meteor/meteor'
import React, { Component, FormEvent } from 'react'
import { Link } from 'react-router-dom'

interface State {
	email: string
	password: string
}

/** Login UI */
export class SignIn extends Component<{ }, State> {

	constructor (props: { }) {
		super(props)

		this.state = {
			email: '',
			password: ''
		}
	}

	public render () {
		return (
			<div className='signin container compact'>
				<h1>Sign in</h1>
				<Form>
					<Form.Item>
						<Input
							type='email'
							placeholder='Email'
							value={ this.state.email }
							onChange={ (event) => this.emailChanged(event) }
							onKeyUp={ (event) => this.keyUp(event) }
						/>
					</Form.Item>
					<Form.Item>
						<Input
							type='password'
							placeholder='Password'
							value={ this.state.password }
							onChange={ (event) => this.passwordChanged(event) }
							onKeyUp={ (event) => this.keyUp(event) }
						/>
					</Form.Item>
					<Form.Item>
						<Button type='primary' onClick={ (event) => this.handleSubmit(event) }>Login</Button>
					</Form.Item>
					<Link to='/forgotpassword'>Forgot password?</Link>
				</Form>
			</div>
		)
	}

	private emailChanged (event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({
			email: event.target.value
		})
	}

	private passwordChanged (event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({
			password: event.target.value
		})
	}

	private keyUp (event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.keyCode === 13) {
			this.handleSubmit(event)
		}
	}

	private handleSubmit (event: FormEvent) {
		event.preventDefault()
		Meteor.loginWithPassword(this.state.email, this.state.password)

		setTimeout(() => document.location.reload(true), 1000)
	}
}
