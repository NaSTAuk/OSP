import { Button, Dropdown, Form, Icon, Input, Menu, message, Popconfirm } from 'antd'
import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { NaSTAUser } from '/imports/api/accounts'
import { Roles } from '/imports/api/helpers/enums'

interface Props {
	user: NaSTAUser
}

interface State {
	selectedRole: Roles
	newPassword: string
}

export class UserTableExpander extends Component<Props, State> {
	constructor(props: Props) {
		super(props)

		this.state = {
			selectedRole: Roles.ADMIN,
			newPassword: '',
		}
	}

	public render() {
		const addRoleDropdown = (
			<Menu key="addRoleDropdown">
				<Menu.Item
					key={Roles.ADMIN}
					onClick={() => {
						this.selectAdminRole(Roles.ADMIN)
					}}>
					{Roles.ADMIN}
				</Menu.Item>
				<Menu.Item
					key={Roles.HOST}
					onClick={() => {
						this.selectAdminRole(Roles.HOST)
					}}>
					{Roles.HOST}
				</Menu.Item>
				<Menu.Item
					key={Roles.JUDGE}
					onClick={() => {
						this.selectAdminRole(Roles.JUDGE)
					}}>
					{Roles.JUDGE}
				</Menu.Item>
				<Menu.Item
					key={Roles.STATION}
					onClick={() => {
						this.selectAdminRole(Roles.STATION)
					}}>
					{Roles.STATION}
				</Menu.Item>
				<Menu.Item
					key={Roles.EDITOR}
					onClick={() => {
						this.selectAdminRole(Roles.EDITOR)
					}}>
					{Roles.EDITOR}
				</Menu.Item>
			</Menu>
		)

		return (
			<div>
				{this.props.user.roles.map((role) => {
					const removeRole = () => {
						this.removeRoleFromUser(role)
						message.success('Role removed')
					}
					return (
						<div key={role}>
							{role}
							{role !== Roles.ADMIN ||
							!(this.props.user.emails || []).some((email) => email.address === 'tech@nasta.tv') ? (
								<Popconfirm
									title="Are you sure you want to remove this role?"
									onConfirm={() => removeRole()}
									okText="Yes"
									cancelText="No">
									<Button type="danger">Remove</Button>
								</Popconfirm>
							) : undefined}
						</div>
					)
				})}
				<Form layout="inline">
					<Form.Item>
						<Dropdown.Button overlay={addRoleDropdown} icon={<Icon key="down" type="down" />}>
							{this.state.selectedRole}
						</Dropdown.Button>
					</Form.Item>
					<Form.Item>
						<Button onClick={() => this.addSelectedRoleToUser()}>Add</Button>
					</Form.Item>
				</Form>
				<Form layout="inline">
					<Form.Item>
						<Input
							placeholder="New Password"
							value={this.state.newPassword}
							onChange={(event) => this.onNewPasswordChange(event)}
						/>
					</Form.Item>
					<Form.Item>
						<Button onClick={() => this.changeUserPassword()}>Change Password</Button>
					</Form.Item>
				</Form>
			</div>
		)
	}

	private removeRoleFromUser(role: Roles) {
		Meteor.call('role.remove', role, this.props.user._id)
	}

	private selectAdminRole(role: Roles) {
		this.setState({
			selectedRole: role,
		})
	}

	private addSelectedRoleToUser() {
		Meteor.call('role.add', this.state.selectedRole, this.props.user._id)
	}

	private changeUserPassword() {
		Meteor.call('accounts.setPassword', this.props.user._id, this.state.newPassword)
		this.setState({
			newPassword: '',
		})
		message.success('Password changed')
	}

	private onNewPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({
			newPassword: event.target.value,
		})
	}
}
