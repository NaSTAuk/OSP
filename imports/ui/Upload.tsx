import { blobToBase64 } from 'base64-blob'
import React, { Component } from 'react'
import { Dropzone } from './Dropzone'
import { Progress } from './Progress'

import { Meteor } from 'meteor/meteor'
import '/imports/ui/css/Upload.css'

interface State {
	uploading: boolean
	successfullUploaded: boolean
	files: File[]
	uploadProgress: { [name: string]: { percentage: number, state: 'pending' | 'done' | 'error'} }
	tries: { [name: string]: number }
}

/**
 * Creates a file upload button.
 */
export class Upload extends Component<{ }, State> {
	constructor (props: any) {
		super (props)

		this.state = {
			files: [],
			uploading: false,
			uploadProgress: { },
			successfullUploaded: false,
			tries: { }
		}

		this.onFilesAdded = this.onFilesAdded.bind(this)
		this.uploadFiles = this.uploadFiles.bind(this)
		this.sendRequest = this.sendRequest.bind(this)
		this.renderActions = this.renderActions.bind(this)
	}

	public render () {
		return (
			<div className='Upload'>
				<span className='Title'>Upload Files</span>
				<div className='Content'>
					<Dropzone onFilesAdded={ this.onFilesAdded} disabled={ this.state.uploading || this.state.successfullUploaded } />
				</div>
				<div className='Files'>
				{
					this.state.files.map((file) => {
						return (
							<div key={ file.name} className='Row'>
								<span className='Filename'>{ file.name}</span>
								{ this.renderProgress(file)}
							</div>
						)
					})
				}
				</div>
				<div className='Actions'>
					{ this.renderActions()}
				</div>
			</div>
		)
	}

	private onFilesAdded (files: File[]) {
		this.setState((prevState) => ({
		  files: prevState.files.concat(files)
		}))
	}

	private renderProgress (file: File) {
		const uploadProgress = this.state.uploadProgress[file.name]
		if (this.state.uploading || this.state.successfullUploaded) {
			return (
			<div className='ProgressWrapper'>
				<Progress progress={ uploadProgress ? uploadProgress.percentage : 0 } />
				<img
					className='CheckIcon'
					alt='done'
					src='baseline-check_circle_outline-24px.svg'
					style={ {
						opacity:
						uploadProgress && uploadProgress.state === 'done' ? 0.5 : 0
					}}
				/>
				{
					this.state.tries[file.name] > 0 ?
					this.state.tries[file.name] >= 5 ?
					<div>
						Uploading failed.
					</div> :
					<div>
						Upload failed, retrying. Attempt: { this.state.tries[file.name] + 1 } / 5
					</div> : undefined
				}
			</div>
			)
		}
	}

	private renderActions () {
		if (this.state.successfullUploaded) {
			return (
				<button onClick={ () =>this.setState({ files: [], successfullUploaded: false }) }>
					Clear
				</button>
			)
		} else {
			return (
				<button disabled={ this.state.files.length < 0 || this.state.uploading } onClick={ this.uploadFiles }>
					Upload
				</button>
			)
		}
	}

	private async uploadFiles () {
		this.setState({ uploadProgress: { }, uploading: true })
		const promises: Array<Promise<unknown>> = []
		this.state.files.forEach((file) => {
			promises.push(this.sendRequest(file))
		})
		try {
			await Promise.all(promises)

			this.setState({ successfullUploaded: true, uploading: false })
		} catch (e) {
			// Not Production ready! Do some error handling here instead...
			this.setState({ successfullUploaded: true, uploading: false })
		}
	}

	private async sendRequest (file: File) {
		return new Promise(async (resolve, reject) => {
			if (file.size <= 100 * 1024 * 1024) {
				this.setState({ uploadProgress: { [file.name]: { percentage: 1, state: 'pending'} }, uploading: true })
				let uploading = true
				let tries = 0
				while (uploading && tries < 5) {
					try {
						return this.uploadSmallFile(file).then(() => {
							uploading = false
							this.setState({ uploadProgress: { [file.name]: { percentage: 100, state: 'done'} }, uploading: true })
						}).catch((err) => {
							tries++
							this.setState({ tries: { [file.name]: tries } })
							console.log(err)
						})
					} catch (err) {
						console.log(err)
					}
				}
			} else {
				try {
					const chunkSize = 8 * 1024 * 1024
					const chunks = this.chunkFile(file, chunkSize)

					console.log('Uploading')

					const sessionId = await this.startUploadSession(chunks[0])

					if (sessionId) {
						console.log(`Got session Id: ${sessionId}`)

						for (let i = 1; i < chunks.length - 1; i++) {
							console.log(file.size)
							console.log(`Appending ${i} of ${chunks.length - 1}`)
							await this.uploadChunk(chunks[i], sessionId, chunkSize, i, false, '')
						}

						await this.uploadChunk(chunks[chunks.length - 1], sessionId, chunkSize, chunks.length - 1, true, `/${file.name}`)
					}
				} catch (err) {
					console.log(err)
				}
			}
		})
	}

	private chunkFile (file: File, chunkSize: number = 8 * 1024 * 1024): Blob[] {
		const chunks = Math.ceil(file.size/chunkSize)
		const fileparts: Blob[] = []

		for (let i = 0; i < chunks; i++) {
			fileparts[i] = file.slice(chunkSize*i, chunkSize*i + chunkSize)
		}
		return fileparts
	}

	private async uploadSmallFile (file: File): Promise<string> {
		const b64Encoding = await blobToBase64(file)
		return new Promise((resolve, reject) => {
			Meteor.call('submission.uploadFile', b64Encoding, `/${file.name}`, (error: any, result: any) => {
				if (error) reject(error)
				resolve(result)
			}) // TODO: Better path
		})
	}

	private async startUploadSession (chunk: Blob): Promise<string> {
		console.log(chunk.size)
		const b64Encoding = await blobToBase64(chunk)
		return new Promise((resolve, reject) => {
			Meteor.call('submission.startSession', b64Encoding, (error: any, result: any) => {
				if (error) reject(error)
				resolve(result)
			})
		})
	}

	private async uploadChunk (
		chunk: Blob, sessionId: string, chunkSize: number, chunkNumber: number, finish: boolean, path: string
	): Promise<any> {
		console.log(chunk.size)
		const b64Encoding = await blobToBase64(chunk)
		return new Promise((resolve, reject) => {
			Meteor.call(
				'submission.uploadChunk', b64Encoding, sessionId, chunkSize, chunkNumber, finish, path,
				(error: any, result: any) => {
					if (error) reject(error)
					resolve(result)
				}
			)
		})
	}
}
