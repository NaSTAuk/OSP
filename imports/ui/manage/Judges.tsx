import { Button, Dropdown, Icon, List, Menu, message } from 'antd'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React, { Component } from 'react'
import { RouteComponentProps, withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { NaSTAUser } from '/imports/api/accounts'
import { Awards } from '/imports/api/awards'
import { Categories, Category } from '/imports/api/categories'
import { Collections, Roles } from '/imports/api/helpers/enums'
import { JudgeToCategory } from '/imports/api/judgeToCategory'

interface Props extends RouteComponentProps {
	loading?: boolean
	judges?: Meteor.User[]
	categories?: Category[]
}

interface State {
	init: boolean
	judgeCategory: {
		[id: string]: Category
	}
}

class ManageJudges extends Component<Props, State> {
	public static getDerivedStateFromProps(nextProps: Props, prevState: State): State {
		if (!nextProps.loading && prevState.init) {
			if (!nextProps.judges) return prevState

			if (!nextProps.categories) return prevState

			const judgeCategory: {
				[id: string]: Category
			} = {}

			nextProps.judges.forEach((judge) => {
				const toCat = JudgeToCategory.findOne({ judgeId: judge._id })

				if (toCat) {
					const cat = Categories.findOne({ _id: toCat.categoryId })

					if (cat) {
						judgeCategory[judge._id] = cat
					}
				}
			})

			return {
				...prevState,
				judgeCategory,
				init: false,
			}
		}

		return prevState
	}

	constructor(props: Props) {
		super(props)

		this.state = {
			init: true,
			judgeCategory: {},
		}
	}

	public render() {
		if (this.props.loading) return <div></div>
		return (
			<div>
				<Link to="/manage">Back</Link>
				<List
					itemLayout="horizontal"
					dataSource={this.props.judges}
					renderItem={(judge) => this.renderJudge(judge)}
					className="list"></List>
			</div>
		)
	}

	private renderJudge(judge: Meteor.User) {
		const selecteCategoryDropdown = (
			<Menu key="addRoleDropdown">
				{this.props.categories
					? this.props.categories.map((cat) => {
							return (
								<Menu.Item
									key={cat._id}
									onClick={() => this.setState({ judgeCategory: { ...this.state.judgeCategory, [judge._id]: cat } })}>
									<b>{`${cat.forAwards}: `}</b>
									{cat.name}
								</Menu.Item>
							)
					  })
					: undefined}
			</Menu>
		)

		return (
			<List.Item key={judge._id} className="item">
				<b>{judge.emails ? judge.emails[0].address : ''}</b>
				<Dropdown.Button
					overlay={selecteCategoryDropdown}
					icon={<Icon key="down" type="down" />}
					style={{ marginLeft: '2%' }}>
					{this.state.judgeCategory[judge._id] ? (
						<span>
							<b>{`${this.state.judgeCategory[judge._id].forAwards}: `}</b>
							{this.state.judgeCategory[judge._id].name}
						</span>
					) : (
						'Select category'
					)}
				</Dropdown.Button>
				<Button
					type="primary"
					disabled={!this.state.judgeCategory[judge._id]}
					onClick={() => this.saveJudge(judge._id)}>
					Save
				</Button>
			</List.Item>
		)
	}

	private async saveJudge(id: string) {
		if (!this.state.judgeCategory[id]) return

		try {
			await Meteor.call('setJudgeToCategory', id, this.state.judgeCategory[id]._id)
			message.success('Judge updated')
		} catch (e) {
			message.error(`Error saving user: ${e}`)
		}
	}
}

export default withTracker((props: Props): Props => {
	const handles = [
		Meteor.subscribe(Collections.JudgeToCategory),
		Meteor.subscribe(Collections.CATEGORIES),
		Meteor.subscribe('users'),
	]

	const loading = handles.some((handle) => !handle.ready())

	const judges = Meteor.users
		.find({})
		.fetch()
		.filter(
			(user) =>
				(user as NaSTAUser).roles.includes(Roles.JUDGE) &&
				(!user.emails || !user.emails.some((email) => email.address === 'tech@nasta.tv'))
		)

	const awards: { [awardId: string]: string } = {}

	Awards.find({})
		.fetch()
		.forEach((award) => {
			if (!award._id) return
			awards[award._id] = award.name
		})

	return {
		...props,
		loading,
		judges,
		categories: Categories.find({}).fetch(),
	}
})(withRouter(ManageJudges) as any)
