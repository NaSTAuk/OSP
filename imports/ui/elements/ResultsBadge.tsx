import { Tag, Icon } from 'antd'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { Results } from '/imports/api/results'

interface Props {
	stationId: string
	categoryId: string
}

interface TrackedProps {
	position: number | undefined
}

class ResultsBadge extends Component<Props & TrackedProps> {
	public render() {
		if (this.props.position === undefined) return <Tag color="red">No Result</Tag>

		return (
			<Tag
				color={
					this.props.position === 1
						? 'gold'
						: this.props.position === 2
						? 'silver'
						: this.props.position < 5
						? 'green'
						: 'lime'
				}>
				{this.props.position < 3 ? <Icon type="trophy" /> : this.ordinal_suffix_of(this.props.position)}
			</Tag>
		)
	}

	private ordinal_suffix_of(i: number): string {
		const j = i % 10
		const k = i % 100
		if (j === 1 && k !== 11) {
			return i + 'st'
		}
		if (j === 2 && k !== 12) {
			return i + 'nd'
		}
		if (j === 3 && k !== 13) {
			return i + 'rd'
		}
		return i + 'th'
	}
}

export default withTracker<Props & TrackedProps, Props>((props: Props) => {
	const results = Results.findOne({
		categoryId: props.categoryId,
	})

	return {
		...props,
		position: results?.order.get(props.stationId),
	}
})(ResultsBadge)
