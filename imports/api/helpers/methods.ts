import { Dropbox } from 'dropbox'
import { check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import fetch from 'node-fetch'
import { Categories } from '../categories'
import { Entries } from '../entries'
import { Evidence, InsertEvidence } from '../evidence'
import { GetStationForUser } from '../stations'
import { SupportingEvidence } from '../supporting-evidence'
import { SupportingEvidenceType } from './enums'

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
				return Promise.resolve(result.id)
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
		}).then((result) => {
			if (result) {
				return result.id
			}
			console.log('Uploaded a small file')
		})
	},
	'award.entered' (awardId: string) {
		return true
	},
	async 'submission.submit' (values: { [key: string]: string }, categoryId: string): Promise<any> {
		check(categoryId, String)

		if (Meteor.userId()) {
			const station = GetStationForUser()

			if (!station) {
				return new Meteor.Error('You do not belong to an eligible station')
			}

			if (!station._id) {
				return new Meteor.Error('You do not belong to an eligible station')
			}

			const category = Categories.findOne({ _id: categoryId })

			if (!category) {
				return new Meteor.Error('Category not found')
			}

			let allPresent = true
			category.supportingEvidence.forEach((ev) => {
				if (!Object.keys(values).includes(ev._id) && ev.type !== SupportingEvidenceType.CALL) {
					allPresent = false
				}
			})

			if (!allPresent) {
				return new Meteor.Error('You have not provided all required evidence for this submission')
			}

			const evidence: string[] = []

			// tslint:disable-next-line: forin
			for (const support of category.supportingEvidence) {
				if (!support._id) {
					continue
				}

				let id = ''
				if (support.type === SupportingEvidenceType.CALL) {
					id = await InsertEvidence({
						content: 'Call Required',
						verified: false,
						supportingEvidenceId: support._id,
						awardId: categoryId,
						stationId: station._id
					})
				} else {
					id = await InsertEvidence({
						content: values[support._id],
						verified: support.type === SupportingEvidenceType.TEXT,
						supportingEvidenceId: support._id,
						awardId: categoryId,
						stationId: station._id
					})
				}

				evidence.push(id)
			}

			Entries.insert({
				stationId: station._id,
				awardId: categoryId,
				date: Date.now(),
				evidenceIds: evidence
			}, (error: string) => {
				if (error) return new Meteor.Error(error)
				return Promise.resolve()
			})
		} else {
			return new Meteor.Error('You\'re not logged in')
		}
	}
})
