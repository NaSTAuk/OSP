import classnames from 'classnames'
import React, { Component, RefObject } from 'react'
import wordcount from 'wordcount'

import '/imports/ui/css/TextInput.css'

interface Props {
	maxWords?: number
	uuid: string
	onValid (uuid: string): void
	onInvalid (uuid: string): void
	onChange (uuid: string, value: string): void
}

interface State {
	wordCount: number
	wordCountClass: string
}

/** Text field input */
export class TextInput extends Component<Props, State> {
	private textAreaRef: RefObject<any>

	constructor (props: Props) {
		super(props)
		this.textAreaRef = React.createRef()
		this.state = {
			wordCount: 0,
			wordCountClass: 'good'
		}

		this.onType = this.onType.bind(this)
	}
	public render () {
		return (
			<div>
				<textarea ref={ this.textAreaRef } placeholder='Your entry here' onChange={ this.onType }></textarea>
				<span className={ classnames('wordCount', this.state.wordCountClass) }>
					{ this.state.wordCount }/{ this.props.maxWords || 0 }
				</span>
			</div>
		)
	}

	private onType () {
		this.setState({ wordCount: wordcount(this.textAreaRef.current.value), wordCountClass: this.getCountClass() })

		this.props.onChange(this.props.uuid, this.textAreaRef.current.value)

		setTimeout(() => {
			if (this.state.wordCount > 0 && (!this.props.maxWords || this.state.wordCount <= this.props.maxWords)) {
				this.props.onValid(this.props.uuid)
			} else {
				this.props.onInvalid(this.props.uuid) // TODO: Should probably only send if state has changed
			}
		}, 200)
	}

	private getCountClass () {
		return  this.state.wordCount > (this.props.maxWords || 0) ? 'error' :
		    this.state.wordCount > (this.props.maxWords || 0) * 0.8 ? 'warning' : 'good'
	}
}
