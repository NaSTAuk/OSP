import React, { Component } from 'react'
import { FAILURE_TYPE } from '/imports/api/entries'

export class TechSpecIssuesList extends Component<{ failures: FAILURE_TYPE[]}> {
	public render () {
		return (
			<ul>
				{
					this.props.failures.map((failure) => {
						switch(failure) {
							case 'MP4':
								return <li>Not an mp4 file</li>
							case '25FPS':
								return <li>Frame rate not 25fps</li>
							case 'AUDIO_BITRATE':
								return <li>Wrong audio bitrate</li>
							case 'AUDIO_FORMAT':
								return <li>AUdio format was not AAC</li>
							case 'AUDIO_SAMPLING_RATE':
								return <li>Wring audio sampling rate</li>
							case 'FORMAT_LEVEL':
								return <li>Wrong mp4 format level</li>
							case 'FORMAT_PROFILE':
								return <li>Wrong mp4 format profile</li>
							case 'PROGRESSIVE':
								return <li>File is interlaced</li>
							case 'SQUARE_PIXELS':
								return <li>File does not use square pixels</li>
							case 'STEREO':
								return <li>File is not stereo</li>
							case 'VIDEO_BITRATE':
								return <li>Wrong video bitrate</li>
							case 'VIDEO_DIMENSIONS':
								return <li>Wrong video dimensions</li>
						}
					})
				}
			</ul>
		)
	}
}
