import React, { ChangeEvent, Component } from 'react'

import '/imports/ui/css/Dropzone.css'

interface Props {
	disabled: boolean
	onFilesAdded (arr: any[]): void
}

interface State {
	highlight: boolean
}

/** Creates a file dropzone */
export class Dropzone extends Component<Props, State> {
	private fileInputRef: any

	constructor (props: any) {
		super(props)
		this.state = { highlight: false }
		this.fileInputRef = React.createRef()
		this.openFileDialog = this.openFileDialog.bind(this)
		this.onFilesAdded = this.onFilesAdded.bind(this)
		this.onDragOver = this.onDragOver.bind(this)
		this.onDragLeave = this.onDragLeave.bind(this)
		this.onDrop = this.onDrop.bind(this)
	}

	public render () {
		return (
			<div className={ `Dropzone ${this.state.highlight ? 'Highlight' : ''}`}
				onDragOver={ this.onDragOver}
				onDragLeave={ this.onDragLeave}
				onDrop={ this.onDrop}
				onClick={ this.openFileDialog}
				style={ { cursor: this.props.disabled ? 'default' : 'pointer' }}
			>
				<img
					alt='upload'
					className='Icon'
					src='baseline-cloud_upload-24px.svg'
				/>
				<input
					ref={ this.fileInputRef}
					className='FileInput'
					type='file'
					multiple
					onChange={ this.onFilesAdded }
					style={ { display: 'none'}}
				/>
				<span>Upload Files</span>
			</div>
		)
	}

	private openFileDialog () {
		if (this.props.disabled) return
		this.fileInputRef.current.click()
	}

	private onDragOver (evt: React.DragEvent<Element>) {
		evt.preventDefault()

		if (this.props.disabled) return

		this.setState({ highlight: true })
	  }

	private onDragLeave () {
		this.setState({ highlight: false })
	  }

	private onDrop (event: React.DragEvent<HTMLDivElement>) {
		event.preventDefault()

		if (this.props.disabled) return

		const files = event.dataTransfer.files
		if (this.props.onFilesAdded) {
		  const array = this.fileListToArray(files)
		  this.props.onFilesAdded(array)
		}
		this.setState({ highlight: false })
	  }

	private onFilesAdded (evt: ChangeEvent<HTMLInputElement>) {
		if (this.props.disabled) return
		const files = evt.target.files
		if (this.props.onFilesAdded) {
			const array = this.fileListToArray(files)
			this.props.onFilesAdded(array)
		}
	}

	private fileListToArray (list: FileList | null) {
		const array: File[] = []
		if (list) {
			for (let i = 0; i < list.length; i++) {
				const item = list.item(i)
				if (item) array.push(item)
			}
		}
		return array
	}
}
