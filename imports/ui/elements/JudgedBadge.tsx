import { Tag } from 'antd'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Score, Scores } from '/imports/api/scores'

interface Props {
	stationId: string
	categoryId: string
}

interface TrackedProps {
	score: Score | undefined
}

class JudgedBadge extends Component<Props & TrackedProps> {
	public render() {
		if (!this.props.score) {
			return <Tag color="red">Not Judged</Tag>
		}

		return <Tag color="green">Judged</Tag>
	}
}

export default withTracker<Props & TrackedProps, Props>((props: Props) => {
	const score = Scores.findOne(
		{
			stationId: props.stationId,
			categoryId: props.categoryId,
		},
		{ sort: { date: -1 } }
	)

	return {
		...props,
		score: score,
	}
})(JudgedBadge)
