import { blobToBase64 } from 'base64-blob'
import React, { Component } from 'react'
import { Dropzone } from './Dropzone'
import { Progress } from './Progress'

import { Meteor } from 'meteor/meteor'
import '/imports/ui/css/Upload.css'

interface Props {
	format: string
	uuid: string
	stationName: string
	categoryName: string
	onUpload (uuid: string): void
	onChange (uuid: string, value: string): void
}

interface State {
	uploading: boolean
	successfullUploaded: boolean
	files: File[]
	uploadProgress: { [name: string]: { percentage: number, state: 'pending' | 'uploading' | 'done' | 'error'} }
	tries: { [name: string]: number }
}

/**
 * Creates a file upload button.
 */
export class Upload extends Component<Props, State> {
	constructor (props: Props) {
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
	}

	public render () {
		return (
			<div className='Upload'>
				<div className='Content'>
					<Dropzone
						onFilesAdded={ this.onFilesAdded}
						disabled={ this.state.uploading || this.state.successfullUploaded }
						format={ this.props.format }
					/>
				</div>
				<div className='Files'>
				{
					this.state.files.map((file) => {
						return (
							<div key={ file.name} className='Row'>
								<span className='Filename'>{ file.name }</span>
								{ this.renderProgress(file) }
							</div>
						)
					})
				}
				</div>
			</div>
		)
	}

	private onFilesAdded (files: File[]) {
		this.setState((_prevState) => ({
		  files
		}))

		setTimeout(() => this.uploadFiles(), 1000)
	}

	private renderProgress (file: File) {
		const uploadProgress = this.state.uploadProgress[file.name]
		if (this.state.uploading || this.state.successfullUploaded) {
			return (
			<div className='ProgressWrapper'>
				<Progress progress={ uploadProgress ? uploadProgress.percentage : 0 } />
				{
					uploadProgress ? <div className='UploadPercent'>{ Math.floor(uploadProgress.percentage) }%</div> : undefined
				}
				{
					this.state.tries[file.name] > 0 ?
					this.state.tries[file.name] >= 5 ?
					<div className='UploadFailed'>
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

	private async uploadFiles () {
		this.setState({ uploadProgress: { }, uploading: true })
		const promises: Array<Promise<unknown>> = []
		let valid = true
		this.state.files.forEach((file) => {
			// Files are limited to 1GB
			if (file.type === this.props.format && file.size <= 1000 * 1024 * 1024) {
				promises.push(this.sendRequest(file))
			} else {
				valid = false
			}
		})

		if (valid) {
			try {
				await Promise.all(promises).then((id: any[]) => {
					if (id[0]) {
						this.props.onChange(this.props.uuid, id[0].replace(/^id:/, ''))
					}
				})

				this.setState({ successfullUploaded: true, uploading: false })
				this.props.onUpload(this.props.uuid)
			} catch (e) {
				console.log(e)
				this.setState({ successfullUploaded: false, uploading: false })
			}
		} else {
			this.setState({ uploadProgress: { }, uploading: false })

			this.setState({ files: [] })
		}
	}

	private async sendRequest (file: File) {
		return new Promise(async (resolve, reject) => {
			if (file.size <= 10 * 1024 * 1024) {
				this.setState({ uploadProgress: { [file.name]: { percentage: 1, state: 'uploading'} }, uploading: true })
				let uploading = true
				let tries = 0
				while (uploading && tries < 5) {
					try {
						return this.uploadSmallFile(file, this.props.stationName, this.props.categoryName).then((id) => {
							this.props.onChange(this.props.uuid, id.replace(/^id:/, ''))
							uploading = false
							this.setState({ uploadProgress: { [file.name]: { percentage: 100, state: 'done'} }, uploading: true })
							resolve()
						}).catch((err) => {
							console.log(err)
							tries++
							this.setState({ tries: { [file.name]: tries } })
						})
					} catch (err) {
						tries++
					}
				}
			} else {
				const tries = 0
				let uploading = true
				while (uploading && tries < 5) {
					try {
						const chunkSize = 8 * 1024 * 1024
						const chunks = this.chunkFile(file, chunkSize)

						console.log('Uploading')

						this.setState(
							{ uploadProgress: { [file.name]: { percentage: 1, state: 'pending'} }, uploading: true }
						)
						const sessionId = await this.startUploadSession(chunks[0])
						this.setState(
							{
								uploadProgress: {
									[file.name]: {
										percentage: (1 / chunks.length) * 100,
										state: 'uploading'
									}
								},
								uploading: true
							}
						)

						if (sessionId) {
							for (let i = 1; i < chunks.length - 1; i++) {
								console.log(`Appending ${i} of ${chunks.length - 1}`)
								await this.uploadChunk(
									chunks[i],
									sessionId,
									chunkSize,
									i,
									false,
									'',
									this.props.stationName,
									this.props.categoryName
								)
								this.setState(
									{
										uploadProgress: {
											[file.name]: {
												percentage: (i / chunks.length) * 100,
												state: 'pending'
											}
										},
										uploading: true
									}
								)
							}

							console.log('Appending final chunk')
							const id = await this.uploadChunk(
								chunks[chunks.length - 1],
								sessionId,
								chunkSize,
								chunks.length - 1,
								true,
								`/${file.name}`,
								this.props.stationName,
								this.props.categoryName
							)
							this.setState({ uploadProgress: { [file.name]: { percentage: 100, state: 'done'} }, uploading: true })
							uploading = false
							resolve(id.replace(/^id:/, ''))
						}
					} catch (err) {
						console.log(err)
					}
				}
				resolve()
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

	private async uploadSmallFile (file: File, stationName: string, categoryName: string): Promise<string> {
		const b64Encoding = await blobToBase64(file)
		return new Promise((resolve, reject) => {
			Meteor.call(
				'submission.uploadFile',
				b64Encoding,
				`/${categoryName.replace(/\s/g, '_')}_${stationName.replace(/\s/g, '_')}_${file.name.replace(/$\//, '')}`,

				(error: any, result: any) => {
					if (error) reject(error)
					resolve(result)
				}
			) // TODO: Better path
		})
	}

	private async startUploadSession (chunk: Blob): Promise<string> {
		const b64Encoding = await blobToBase64(chunk)
		return new Promise((resolve, reject) => {
			Meteor.call('submission.startSession', b64Encoding, (error: any, result: any) => {
				if (error) reject(error)
				resolve(result)
			})
		})
	}

	private async uploadChunk (
		chunk: Blob,
		sessionId: string,
		chunkSize: number,
		chunkNumber: number,
		finish: boolean,
		path: string,
		stationName: string,
		categoryName: string
	): Promise<any> {
		const b64Encoding = await blobToBase64(chunk)
		return new Promise((resolve, reject) => {
			Meteor.call(
				'submission.uploadChunk',
				b64Encoding,
				sessionId,
				chunkSize,
				chunkNumber,
				finish,
				`/${categoryName.replace(/\s/g, '_')}_${stationName.replace(/\s/g, '_')}_${path.replace(/^\/+/, '').replace(/\s/g, '_')}`,

				(error: any, result: any) => {
					if (error) reject(error)
					resolve(result)
				}
			)
		})
	}
}
