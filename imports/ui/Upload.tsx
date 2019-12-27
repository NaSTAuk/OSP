import { Dropbox } from 'dropbox'
import React, { Component } from 'react'
import { Dropzone } from './Dropzone'
import { Progress } from './Progress'

import '/imports/ui/css/Upload.css'

interface State {
	uploading: boolean
	successfullUploaded: boolean
	files: File[]
	uploadProgress: { [name: string]: { percentage: number, state: 'pending' | 'done' | 'error'} }
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
			successfullUploaded: false
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
			const req = new XMLHttpRequest()

			req.upload.addEventListener('progress', (event) => {
				if (event.lengthComputable) {
					const copy = { ...this.state.uploadProgress }
					copy[file.name] = {
						state: 'pending',
						percentage: (event.loaded / event.total) * 100
					}
					this.setState({ uploadProgress: copy })
				}
			})

			req.upload.addEventListener('load', () => {
				const copy = { ...this.state.uploadProgress }
				copy[file.name] = { state: 'done', percentage: 100 }
				this.setState({ uploadProgress: copy })
				resolve(req.response)
			})

			req.upload.addEventListener('error', () => {
				const copy = { ...this.state.uploadProgress }
				copy[file.name] = { state: 'error', percentage: 0 }
				this.setState({ uploadProgress: copy })
				reject(req.response)
			})

			const ACCESS_TOKEN = ''
			const dbx = new Dropbox({ accessToken: ACCESS_TOKEN, fetch })

			if (file.size <= 100 * 1024 * 1024) {
				dbx.filesUpload({
					contents: file,
					path: '/' + file.name // TODO: Better path + unique
				}).catch((error) => {
					console.log(error)
				}).then(() => {
					console.log('Uploaded a small file')
				})
			} else {
				const chunkSize = 8 * 1024 * 1024
				const chunks = this.chunkFile(file, chunkSize)

				const result = await dbx.filesUploadSessionStart({
					contents: chunks[0],
					close: false
				})

				console.log('Uploading')

				if (result.session_id) {
					for (let i = 1; i < chunks.length - 1; i++) {
						console.log(`Appending ${i} of ${chunks.length - 1}`)
						await dbx.filesUploadSessionAppend({
							contents: chunks[i],
							session_id: result.session_id,
							offset: i*chunkSize
						})
					}
					console.log(chunkSize * (chunks.length))
					dbx.filesUploadSessionFinish({
						contents: chunks[chunks.length - 1],
						cursor: {
							session_id: result.session_id,
							offset: chunkSize * (chunks.length - 1)
						},
						commit: {
							path: '/' + file.name, // TODO: Better path + unique
							mode: {
								'.tag': 'add'
							}
						}
					} as any).catch((error) => {
						console.log(error)
					})
					console.log('Done')
				} else {
					console.log('Retry') // TODO: Be smarter
				}
			}
		})
	}

	private chunkFile (file: File, chunkSize: number = 8 * 1024 * 1024) {
		const chunks = Math.ceil(file.size/chunkSize)
		const fileparts = new Array()

		for (let i = 0; i < chunks; i++) {
			fileparts[i] = file.slice(chunkSize*i, chunkSize*i + chunkSize)
		}
		return fileparts
	}
}
