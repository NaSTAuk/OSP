import { Dropbox } from 'dropbox'
import { check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import fetch from 'node-fetch'

export const DROPBOX_TOKEN = Meteor.settings.dropbox.accessToken

const dbx = new Dropbox({ accessToken: DROPBOX_TOKEN, fetch })

function b64ToBuffer (b64Encoding: string): Buffer {
	const index = b64Encoding.indexOf(';base64,')

	return new Buffer(b64Encoding.slice(index + ';base64,'.length), 'base64')
}

Meteor.methods({
	async 'submission.startSession' (chunk: string): Promise<any> {
		check(chunk, String)
		console.log('Starting new upload session')
		return dbx.filesUploadSessionStart({
			contents: b64ToBuffer(chunk),
			close: false
		}).catch((err) => {
			return Promise.reject(err)
		}).then((result) => {
			return Promise.resolve(result.session_id)
		})
	},
	async 'submission.uploadChunk' (
		chunk: string, sessionId: string, chunkSize: number, chunkNumber: number, finish: boolean, path: string
	): Promise<any> {
		check(chunk, String)
		check(sessionId, String)
		check(chunkSize, Number)
		check(chunkNumber, Number)
		check(finish, Boolean)
		check(path, String)

		console.log(`Uploading offset ${chunkNumber*chunkSize}`)

		if (finish) {
			return dbx.filesUploadSessionFinish({
				contents: b64ToBuffer(chunk),
				cursor: {
					session_id: sessionId,
					offset: chunkSize * chunkNumber
				},
				commit: {
					path, // TODO: Better path + unique
					mode: {
						'.tag': 'add'
					}
				}
			} as any).catch((err) => {
				return Promise.reject(err)
			}).then((result) => {
				return Promise.resolve(result)
			})
		} else {
			return dbx.filesUploadSessionAppend({
				contents: b64ToBuffer(chunk),
				session_id: sessionId,
				offset: chunkNumber*chunkSize
			}).catch((err) => {
				return Promise.reject(err)
			}).then((result) => {
				return Promise.resolve(result)
			})
		}
	},
	async 'submission.uploadFile' (b64Encoding: string, path: string) {
		check(b64Encoding, String)
		check(path, String)

		const file = b64ToBuffer(b64Encoding)

		if (file.length > 100 * 1024 * 1024) {
			console.log('Too large')
			return // TODO: Send some error
		}

		return dbx.filesUpload({
			contents: file,
			path // TODO: Better path + unique
		}).catch((error) => {
			console.log(error)
		}).then(() => {
			console.log('Uploaded a small file')
		})
	}
})
