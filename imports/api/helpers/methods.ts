import { Dropbox } from 'dropbox'
import { check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import fetch from 'node-fetch'
import { NaSTAUser, UserHasRole } from '../accounts'
import { Categories } from '../categories'
import { Entries } from '../entries'
import { Evidence, EvidencePDF, EvidenceVideo, InsertEvidence } from '../evidence'
import { Scores } from '../scores'
import { GetStationForUser, Stations } from '../stations'
import { SupportingEvidencePDF, SupportingEvidenceVideo } from '../supporting-evidence'
import { Roles, SupportingEvidenceType } from './enums'

export const DROPBOX_TOKEN = Meteor.settings.dropbox.accessToken

const dbx = new Dropbox({ accessToken: DROPBOX_TOKEN, fetch })

function b64ToBuffer (b64Encoding: string): Buffer {
	const index = b64Encoding.indexOf(';base64,')

	return new Buffer(b64Encoding.slice(index + ';base64,'.length), 'base64')
}

function GetSharingLink (filePathLower: string): Promise<string> {
	return new Promise((resolve, reject) => {
		dbx.sharingCreateSharedLinkWithSettings({
			path: filePathLower,
			settings: {
				requested_visibility: {
					'.tag': 'public'
				},
				audience: {
					'.tag': 'public'
				}
			}
		}).then((result) => {
			resolve(result.url)
		}).catch((err) => {
			reject(err)
		})
	})
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
					path,
					mode: {
						'.tag': 'add'
					}
				}
			} as any).catch((err) => {
				return Promise.reject(err)
			}).then((result) => {
				return Promise.resolve(result.path_lower)
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
	async 'submission.uploadFile' (b64Encoding: string, path: string): Promise<any> {
		check(b64Encoding, String)
		check(path, String)

		const file = b64ToBuffer(b64Encoding)

		if (file.length > 100 * 1024 * 1024) {
			console.log('Too large')
			return // TODO: Send some error
		}

		return dbx.filesUpload({
			contents: file,
			path
		}).catch((error) => {
			console.log(error)
		}).then((result) => {
			if (result) {
				return Promise.resolve(result.path_lower)
			}
			console.log('Uploaded a small file')
		})
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
						type: SupportingEvidenceType.CALL,
						content: 'Call Required',
						verified: false,
						supportingEvidenceId: support._id,
						awardId: categoryId,
						stationId: station._id
					})
				} else {
					if (support.type === SupportingEvidenceType.VIDEO || support.type === SupportingEvidenceType.PDF) {

						let sharingLink = ''

						try {
							sharingLink = await GetSharingLink(values[support._id])
						} catch (error) {
							if (error.error.error['.tag'] === 'shared_link_already_exists') {
								const prev = Evidence.findOne({
									stationId: station._id,
									awardId: categoryId,
									supportingEvidenceId: support._id
								}) as EvidenceVideo | EvidencePDF | undefined

								if (prev && prev.sharingLink.length) {
									sharingLink = prev.sharingLink
								} else {
									throw new Error('Something went wrong, please try again')
								}
							}
						}

						id = await InsertEvidence({
							type: support.type,
							content: values[support._id],
							verified: false,
							supportingEvidenceId: support._id,
							awardId: categoryId,
							stationId: station._id,
							sharingLink
						})
					} else {
						id = await InsertEvidence({
							type: support.type,
							content: values[support._id],
							verified: support.type === SupportingEvidenceType.TEXT,
							supportingEvidenceId: support._id,
							awardId: categoryId,
							stationId: station._id
						})
					}
				}

				evidence.push(id)
			}

			Entries.insert({
				stationId: station._id,
				categoryId,
				date: Date.now(),
				evidenceIds: evidence
			}, (error: string) => {
				if (error) return new Meteor.Error(error)
				return Promise.resolve()
			})
		} else {
			return new Meteor.Error('You\'re not logged in')
		}
	},
	'role.add' (role: Roles, userId: string) {
		check(userId, String)

		if (!Meteor.userId() || !UserHasRole([Roles.ADMIN])) return

		const user = Meteor.users.findOne({ _id: userId }) as NaSTAUser

		if (!user) return

		if (user.roles.includes(role)) return

		Meteor.users.update(userId, {
			$set: {
				roles: [...user.roles, role]
			}
		})
	},
	'role.remove' (role: Roles, userId: string) {
		check(userId, String)

		if (!Meteor.userId() || !UserHasRole([Roles.ADMIN])) return

		const user = Meteor.users.findOne({ _id: userId }) as NaSTAUser

		if (!user) return

		if (user.roles.includes(role)) {
			Meteor.users.update(userId, {
				$set: {
					roles: user.roles.filter((r) => r !== role)
				}
			})
		}
	},
	'station.add' (name: string) {
		check(name, String)

		if (!Meteor.userId() || !UserHasRole([Roles.ADMIN])) return

		const exists = Stations.find({ name }).fetch()

		if (exists.length) return

		Stations.insert({
			name,
			eligibleForEntry: true,
			authorizedUsers: []
		})
	},
	'station.delete' (id: string) {
		check (id, String)

		if (!Meteor.userId() || !UserHasRole([Roles.ADMIN])) return

		const exists = Stations.find({ _id: id }).fetch()

		if (!exists.length) return

		Stations.remove({ _id: id })

		Meteor.subscribe('users')

		Meteor.users.find({ stationId: id }).fetch().forEach((user) => {
			Meteor.users.remove({ _id: user._id })
		})
	},
	async 'score.add' (stationId: string, categoryId: string, judgedBy: string, comments: string, score: number) {
		return new Promise((resolve, reject) => {
			const existing = Scores.findOne({ stationId, categoryId, judgedBy })

			if (existing) {
				Scores.update({ _id: existing._id }, {
					stationId,
					categoryId,
					judgedBy,
					comments,
					score,
					date: Date.now()
				}, { }, (error: string) => {
					if (error) reject(error)
					resolve()
				})
			} else {
				Scores.insert({
					stationId,
					categoryId,
					judgedBy,
					comments,
					score,
					date: Date.now()
				}, (error: string) => {
					if (error) reject(error)
					resolve()
				})
			}
		})
	}
})