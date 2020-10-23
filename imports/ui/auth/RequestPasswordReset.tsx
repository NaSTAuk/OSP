import { Button, Form, Input, message } from 'antd'
import { Accounts } from 'meteor/accounts-base'
import React, { Component } from 'react'
import { RouteComponentProps, withRouter } from 'react-router'

interface State {
	email: string
}

class RequestPasswordReset extends Component<RouteComponentProps, State> {
	public render() {
		return (
			<div className="signin container compact">
				<h1>Request Password Reset</h1>
				<Form>
					<Form.Item>
						<h3>Enter Your Email</h3>
						<Input onChange={(event) => this.emailChange(event)}></Input>
					</Form.Item>
					<Button type="primary" onClick={() => this.handleSubmit()}>
						Submit
					</Button>
				</Form>
				<p>
					If you require further assistance, contact <a href="mailto:tech@nasta.tv">tech@nasta.tv</a>
				</p>
			</div>
		)
	}

	private emailChange(event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({
			email: event.target.value,
		})
	}

	private handleSubmit() {
		Accounts.forgotPassword({ email: this.state.email }, (err?: Error) => {
			if (err) {
				message.error('Could not find an account with that email address')
			} else {
				message.success('Password reset email sent')
				setTimeout(() => this.props.history.replace('/resetredirect'), 2000)
			}
		})
	}
}

export default withRouter(RequestPasswordReset)
