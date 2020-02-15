import { Button, Form, Input } from 'antd'
import { Accounts } from 'meteor/accounts-base'
import React, { Component } from 'react'
import { RouteComponentProps, withRouter } from 'react-router'

interface Props extends RouteComponentProps {
	token: string
}

interface State {
	password: string
	error: string
}

class ResetPassword extends Component<Props, State> {

	constructor (props: Props) {
		super(props)

		this.state = {
			password: '',
			error: ''
		}
	}

	public render () {
		return (
			<div className='signin container compact'>
				<Form>
					<Form.Item>
						<h3>New Password (min 12 characters)</h3>
						<Input onChange={ (event) => this.passwordChange(event)}></Input>
					</Form.Item>
					<Button type='primary' onClick={ () => this.handleSubmit() } disabled={ this.state.password.length < 12}>
						Submit
					</Button>
					{ this.state.error }
				</Form>
			</div>
		)
	}

	private passwordChange (event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({
			password: event.target.value
		})
	}

	private handleSubmit () {
		Accounts.resetPassword(this.props.token, this.state.password, (err) => {
			if (err) {
				this.setState({
					error: 'Sorry we could not reset your password. Please try again.'
				})
			} else {
				this.props.history.replace('/resetredirect')
			}
		})
	}
}

export default withRouter(ResetPassword)
