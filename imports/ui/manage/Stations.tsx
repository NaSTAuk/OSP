import { Button, Form, Input } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
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
				<h1>Stations</h1>
				{ this.renderAddStationForm() }
				<h2>Registered Stations</h2>
				{
					this.props.stations.map((station) => {
						return (
							<div key={ station._id }>
								{ station.name }
								{
									station.name !== 'NaSTA' ?
									<Button type= 'danger' onClick= { () => this.deleteStation(station._id) }>Remove</Button> :
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
