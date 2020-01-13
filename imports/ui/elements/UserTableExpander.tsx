import { Button, Dropdown, Form, Icon, Menu } from 'antd'
import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { NaSTAUser } from '/imports/api/accounts'
import { Roles } from '/imports/api/helpers/enums'

interface Props {
	user: NaSTAUser
}

interface State {
	selectedRole: Roles
}

export class UserTableExpander extends Component<Props, State> {

	constructor (props: Props) {
		super(props)

		this.state = {
			selectedRole: Roles.ADMIN
		}
	}

	public render () {
		const addRoleDropdown = (
			<Menu key='addRoleDropdown'>
				<Menu.Item key={ Roles.ADMIN } onClick={ () => { this.selectAdminRole(Roles.ADMIN) }}>
					{ Roles.ADMIN }
				</Menu.Item>
				<Menu.Item key={ Roles.HOST } onClick={ () => { this.selectAdminRole(Roles.HOST) }}>
					{ Roles.HOST }
				</Menu.Item>
				<Menu.Item key={ Roles.JUDGE } onClick={ () => { this.selectAdminRole(Roles.JUDGE) }}>
					{ Roles.JUDGE }
				</Menu.Item>
				<Menu.Item key={ Roles.STATION } onClick={ () => { this.selectAdminRole(Roles.STATION) }}>
					{ Roles.STATION }
				</Menu.Item>
			</Menu>
		)

		return (
			<div>
				{
					this.props.user.roles.map((role) => {
						return (
							<div key={ role}>
								{ role }
								{
									role !== Roles.ADMIN ?
									<Button type='danger' onClick={ () => this.removeRoleFromUser(role) }>Remove</Button> :
									undefined
								}
							</div>
						)
					})
				}
				<Form layout='inline'>
					<Form.Item>
						<Dropdown.Button overlay={ addRoleDropdown } icon={ <Icon key='down' type='down' /> }>
							{ this.state.selectedRole }
						</Dropdown.Button>
					</Form.Item>
					<Form.Item>
						<Button onClick={ () => this.addSelectedRoleToUser() }>
							Add
						</Button>
					</Form.Item>
				</Form>
			</div>
		)
	}

	private removeRoleFromUser (role: Roles) {
		Meteor.call('role.remove', role, this.props.user._id)
	}

	private selectAdminRole (role: Roles) {
		this.setState({
			selectedRole: role
		})
	}

	private addSelectedRoleToUser () {
		Meteor.call('role.add', this.state.selectedRole, this.props.user._id)
	}
}
