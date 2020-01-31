import { Button, Dropdown, Form, Icon, Input, Menu, message, Popconfirm, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { NaSTAUser } from '../../api/accounts'
import { Station, Stations } from '../../api/stations'
import { UserTableExpander } from '../elements/UserTableExpander'

interface Props {
	users: NaSTAUser[],
	stations: Station[]
}

interface State {
	addUserFormStationId?: string
	addUserFormStationName?: string
	addUserFormEmail?: string
	addUserFormError?: string
	addUserFormPassword?: string
}

/** User management table */
class ManageUsers extends Component<Props, State> {

	constructor (props: Props) {
		super(props)

		this.state = { }
	}

	public render () {
		return (
			<div>
				<Link to='/manage'>Back</Link>
				<h1>Users</h1>
				{ this.renderAddUserForm() }
				{ this.renderUserTable() }
			</div>
		)
	}

	private renderAddUserForm () {
		const setAddUserFormStationId = (stationId?: string) => {
			const station = Stations.findOne({ _id: stationId })

			if (!station) return

			this.setState({
				addUserFormStationId: stationId,
				addUserFormStationName: station.name
			})
		}

		const stationDropdown = (
			<Menu key='stationDropdown'>
				{
					this.props.stations.map((station) => {
						return (
							<Menu.Item key={ station._id} onClick={ () => { setAddUserFormStationId(station._id) }}>
								{ station.name }
							</Menu.Item>
						)
					})
				}
			</Menu>
		)

		const disableButton = () => {
			const valid = this.state.addUserFormStationId &&
				this.state.addUserFormStationName &&
				this.state.addUserFormEmail &&
				this.state.addUserFormEmail.length >= 5
			return !valid
		}

		const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			this.setState({
				addUserFormEmail: e.target.value
			})
		}

		return (
			<div>
				<Form layout='inline'>
					<Form.Item>
						<Input
							placeholder='Email'
							type='email'
							onChange={ (event) => handleEmailChange(event) }
						/>
					</Form.Item>
					<Form.Item>
						<Dropdown.Button overlay={ stationDropdown} icon={ <Icon key='down' type='down' /> }>
							{
								this.state.addUserFormStationId && this.state.addUserFormStationName ?
								this.state.addUserFormStationName :
								'Station'
							}
						</Dropdown.Button>
					</Form.Item>
					<Form.Item>
						<Button
							type='primary'
							htmlType='submit'
							onClick={ (event) => this.handleSubmit(event)}
							disabled={ disableButton() }
						>
							Add
						</Button>
					</Form.Item>
				</Form>
				{ this.state.addUserFormError ? `Error: ${this.state.addUserFormError}` : undefined }
			</div>
		)
	}

	private async handleSubmit (event: React.FormEvent<Element>) {
		event.preventDefault()

		try {
			await this.addUser()
		} catch (error) {
			this.setState({
				addUserFormError: error.error.toString()
			})
		}
	}

	private async addUser (): Promise<boolean> {
		return new Promise((resolve, reject) => {
			Meteor.call(
				'accounts.new.withStation',
				this.state.addUserFormEmail,
				this.state.addUserFormStationId,
				(error: string, result: boolean) => {
					if (error) reject(error)
					resolve(result)
				}
			)
		})
	}

	private renderUserTable () {
		const columns: Array<ColumnProps<NaSTAUser>> = [
			{
				title: 'Station',
				dataIndex: 'stationId',
				key: 'stationId',
				render: (stationId?: string) => {
					if (!stationId) return 'None'

					const station = this.props.stations.find((stat) => stat._id === stationId)

					if (!station) return 'Unknown'

					return station.name
				}
			},
			{
				title: 'Email Addresses',
				dataIndex: 'emails',
				key: 'emails',
				render: (emails: Array<{ address: string, verified: boolean }>) => {
					return (
						<div>
							{
								emails.map((email) => {
									return <div key={ email.address }>{ email.address }</div>
								})
							}
						</div>
					)
				}
			},
			{
				title: 'Roles',
				dataIndex: 'roles',
				key: 'roles',
				render: (roles?: string[]) => {
					if (!roles) return 'None'
					return (
						<div>
							{
								roles.map((role) => {
									return <div key={ role }>{ role }</div>
								})
							}
						</div>
					)
				}
			},
			{
				title: '',
				dataIndex: '',
				key: 'x',
				render: (record: NaSTAUser) => {
					if (record.emails && record.emails.some((email) => email.address === 'tech@nasta.tv')) return ''

					const deleteAccount = () => {
						Meteor.call('accounts.delete', record._id)
						message.success('Account deleted')
					}

					return (
						<Popconfirm
							title='Are you sure you want to delete this account?'
							onConfirm={ () => deleteAccount() }
							okText='Yes'
							cancelText='No'
						>
							<Button type='danger'>Delete</Button>
						</Popconfirm>
					)
				}
			}
		]

		return (
			<Table
				rowKey={ (record) => record._id }
				dataSource={ this.props.users }
				columns={ columns }
				expandedRowRender={ (user) => <UserTableExpander user={ user } /> }
			/>
		)
	}
}

export default withTracker(() => {
	Meteor.subscribe('users')
	Meteor.subscribe('stations')

	return {
		users: Meteor.users.find().fetch() as NaSTAUser[],
		stations: Stations.find().fetch()
	}
})(ManageUsers as any)
