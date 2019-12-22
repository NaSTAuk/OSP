import React, { Component } from 'react'

import '/imports/ui/css/Progress.css'

interface Props {
	progress: number
}

/** Displays a progress bar */
export class Progress extends Component<Props> {
	constructor (props: any) {
		super(props)
		this.state = { }
	}

	public render () {
		return (
			<div className='ProgressBar'>
				<div className='Progress' style={ { width: this.props.progress + `%`}}></div>
			</div>
		)
	}
}
