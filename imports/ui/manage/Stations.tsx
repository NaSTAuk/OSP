import { Button, Form, Input, message, Popconfirm } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Station, Stations } from '/imports/api/stations'

interface Props {
	stations: Station[]
}

interface State {
	stationNameRef: React.RefObject<Input>
}

class ManageStations extends Component<Props, State> {
	constructor (props: Props) {
		super (props)

		this.state = {
			stationNameRef: React.createRef<Input>()
		}
	}
	public render () {
		return (
			<div>
				<Link to='/manage'>Back</Link>
				<h1>Stations</h1>
				{ this.renderAddStationForm() }
				<h2>Registered Stations</h2>
				{
					this.props.stations.map((station) => {
						const deleteStation = () => {
							this.deleteStation(station._id)
							message.success('Station deleted')
						}
						return (
							<div key={ station._id }>
								{ station.name }
								{
									station.name !== 'NaSTA' ?

									<Popconfirm
										title='Are you sure you want to delete this station?'
										onConfirm={ () => deleteStation() }
										okText='Yes'
										cancelText='No'
									>
										<Button type= 'danger'>Remove</Button>
									</Popconfirm> :
									undefined
								}
							</div>
						)
					})
				}
			</div>
		)
	}

	private renderAddStationForm () {
		return (
			<Form layout='inline'>
				<Form.Item>
					<Input placeholder='name' ref={ this.state.stationNameRef } />
				</Form.Item>
				<Form.Item>
					<Button type='default' onClick={ () => this.addStation()}>Add</Button>
				</Form.Item>
			</Form>
		)
	}

	private deleteStation (id?: string) {
		if (!id) return

		Meteor.call('station.delete', id as string)
	}

	private addStation () {
		const node = this.state.stationNameRef.current

		if (node) {
			Meteor.call('station.add', node.input.value)
		}
	}
}

export default withTracker(() => {
	Meteor.subscribe('stations')

	return {
		stations: Stations.find().fetch()
	}
})(ManageStations as any)
