import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { MINUTE } from './constants'
import { Collections, DEFAULT_AWARDS_NAMES, DEFAULT_CATEGORY_NAMES, SupportingEvidenceType } from './enums'
import { SupportingEvidence } from './supporting-evidence'

export interface Category {
	_id?: string
	name: string
	supportingEvidence: SupportingEvidence[]
	description: string
	forAwards: string
}

export const Categories = new Mongo.Collection<Category>(Collections.CATEGORIES)

if (Meteor.isServer) {
	Meteor.publish(Collections.CATEGORIES, function categoriesPublication () {
		return Categories.find()
	})
}

export const DEFAULT_CATEGORIES: Category[] = [
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_BEST_BROADCASTER,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			},
			{
				type: SupportingEvidenceType.PDF,
				maxLength: '500 Words'
			}
		],
		description: 'A showreel demonstrating the range, quality and skills of the station and its programming, to be accompanied by a written report, with details of the operation of the station and contributions made which may not necessarily appear on screen.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_JISC,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.TEXT,
				maxLength: 750,
				description: ''
			},
			{
				type: SupportingEvidenceType.CALL,
				description: 'Skype call between representatives from Jisc and the entering station.'
			}
		],
		description: 'This category looks for a station worthy of special recognition for outstanding achievement, especially with respect to the station’s commitment to overcoming challenging circumstances and achievement through innovation in the past year.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_BEST_DRAMATIC_PERFORMANCE,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 5 * MINUTE
			}
		],
		description: 'A showreel demonstrating the on-screen acting skills, styles and techniques of a particular Individual in any form of fictional production. This showreel may be made up of content from multiple productions or episodes.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_BEST_ON_SCREEN_TALENT,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 5 * MINUTE
			}
		],
		description: 'A showreel demonstrating the on-screen skills, styles and techniques of aparticular individual in any production excluding fictional content. This showreel may be made up of content from multiple productions.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_STATION_MARKETING,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE,
				description: 'A video submission demonstrating the achievements of your station’s marketing recognising how your station recruited members and built audiences across your campus and online, incorporating special events, advertising, social media and on-air branding and idents.'
			},
			{
				type: SupportingEvidenceType.TEXT,
				maxLength: 500,
				description: 'The submission must be accompanied by a written document detailing marketing strategies, tools, and techniques used by your station.'
			}
		],
		description: 'Recruiting and retaining members, and building an audience are two of the biggest challenges faced by student TV stations. This award recognises the efforts that stations go to to ensure that they have an active membership and that their content is watched and valued by their university, local and national viewers.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_TECHNICAL_ACHIEVEMENT,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.PDF,
				maxLength: '500 Words'
			}
		],
		description: 'A report which gives an account of any technical achievement(s) and/or developed to support your station’s output. Entries will demonstrate both the technical challenges faced and overcome, and the benefits this brought to the production(s).',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_FRESHERS_COVERAGE,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			}
		],
		description: 'This category recognises the quality and diversity of a station\'s covering of their campus\' Freshers\' week(s) activities. This category also includes all including all freshers\' themed content.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_ANIMATION,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			}
		],
		description: 'A single animation programme (or a shortened edit from an episode or series), or an original piece of animation of any type, which has been produced by the station. This can include but is not limited to: Cartoons, Computer generated images, Title sequences.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_NEWS_AND_CURRENT_AFFAIRS,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			}
		],
		description: 'A single programme (or a shortened edit from an episode or series) that demonstrates coverage of university, local community, national or international news. It demonstrates an understanding of television journalism and utilises, where appropriate, the skills of video journalism.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_MARS_ELKINS_EL_BROGY,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			}
		],
		description: 'A showreel demonstrating effective, innovative and strong use of multimedia content with an accompanying document.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_WRITING,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 5 * MINUTE,
				description: 'Video entry limit of 5 minutes for reference, demonstrating how the script has been visualized.'
			},
			{
				type: SupportingEvidenceType.PDF,
				maxLength: '',
				description: 'Written entry limit of 30 pages of text at font size 12. This will be what is judged.'
			}
		],
		description: 'A script in any genre or format, for any kind of show produced by the station. This can include, but is not limited to, fictional teleplays, factual links and features, documentary scripts, live scripts, news piece, etc. Writing may be from a single programme or shortened from an episode or series.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_LIVE_BROADCAST,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			}
		],
		description: 'A single programme (or a shortened edit from an episode or series) that has been broadcast live or shot as-live by your station. Entries for this category must not have had any audio or video processing applied after transmission. Entries may be edited in post production to produce a showreel e.g. any part of the broadcast edited together to music, but must not have processing to fix technical problems that were present during the broadcast e.g. edit music from a multitrack recording, compressors/gates applied, colour correction, exposure changes, filters.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_CINEMATOGRAPHY,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			}
		],
		description: 'An opportunity for filmmakers to showcase their best work, demonstrating a knowledge of appropriate lighting, camera moves and other associated techniques of the craft, and how well these things are implemented in film or television. This showreel should be made up of content from a single programme (or a shortened edit from an episode or series)',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_LIGHT_ENTERTAINMENT,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			}
		],
		description: 'A single programme (or a shortened edit from an episode or series) intended as light entertainment.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_TITLE_SEQUENCE,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 90 * 1000
			},
			{
				type: SupportingEvidenceType.TEXT,
				maxLength: 100,
				description: 'Written entry limit of 100 words, not judged but allowed to help judge how well the entry introduces the program. This is supplementary evidence and not judged in itself.'
			}
		],
		description: 'The introductory sequence to one of your station’s programmes. The very beginning of an exemplar programme may be included. This entry must be a complete video not a cut down video or an edited highlights reel.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_COMEDY,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			}
		],
		description: 'A single programme or series episode that aims to make the viewer laugh, including, but not limited to: Sitcoms, Comedy Dramas, Stand-up, SketchShows.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_DRAMA,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			}
		],
		description: 'A single programme (or a shortened edit from an episode or series) oforiginal scripted dramatic production. Note: Sitcoms or dramatic productions which are primarily comedic should be entered for the Comedy category.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.DOCUMENTARY_AND_FACTUAL,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			}
		],
		description: 'A single programme (or a shortened edit from an episode or series) featuring factual material, presented in any format.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_SPORT,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			}
		],
		description: 'Coverage of a sporting event or a single programme (or a shortened edit from an episode or series) which features live or recorded sport, and/or comments on sport or sports facilities.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.NaSTA_AWARDS_POST_PRODUCTION_AWARD,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			}
		],
		description: 'A single programme (or a shortened edit from an episode or series) showreel demonstrating excellent post production and editing skills.',
		forAwards: DEFAULT_AWARDS_NAMES.NASTA
	},
	{
		name: DEFAULT_CATEGORY_NAMES.PCAs_OPEN,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			}
		],
		description: 'Any video content can be entered into this category.',
		forAwards: DEFAULT_AWARDS_NAMES.PEOPLES_CHOICE
	},
	{
		name: DEFAULT_CATEGORY_NAMES.PCAs_LIVE_BROADCAST,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			}
		],
		description: 'A single programme (or a shortened edit from an episode or series) that has been broadcast live or shot as-live by your station. Entries for this category must not have had any audio or video processing applied after transmission. Entries may be edited in post production to produce a showreel e.g. any part of the broadcast edited together to music, but must not have processing to fix technical problems that were presentduring the broadcast e.g. edit music from a multitrack recording, compressors/gates applied, colour correction, exposure changes, filters.',
		forAwards: DEFAULT_AWARDS_NAMES.PEOPLES_CHOICE
	},
	{
		name: DEFAULT_CATEGORY_NAMES.PCAs_CONTENT_INNOVATION,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			}
		],
		description: 'A single programme (or a shortened edit from an episode or series) showreel demonstrating innovative content. This can be an innovative show format, innovation in the use of features or segments, or innovative ways of engaging with your audience.',
		forAwards: DEFAULT_AWARDS_NAMES.PEOPLES_CHOICE
	},
	{
		name: DEFAULT_CATEGORY_NAMES.PCAs_TECHNICAL_INNOVATION,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.PDF,
				maxLength: '500 Words',
				description: 'A report which gives an account of any technical innovation developed to support your station’s output. Entries will demonstrate both the technical challenges faced, the innovative way(s) in which they were overcome, and the benefits this brought to the production(s).'
			}
		],
		description: 'It is expected that entries for this award demonstrate some technical development by your station, either in software (including online) or hardware, rather than use of existing technical solutions.',
		forAwards: DEFAULT_AWARDS_NAMES.PEOPLES_CHOICE
	},
	{
		name: DEFAULT_CATEGORY_NAMES.PCAs_VISUAL_CREATIVITY_AND_QUALITY,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			}
		],
		description: 'A single programme (or a shortened edit from an episode or series) showcasing excellence in the following areas: cinematography, editing, animations and visual effects.',
		forAwards: DEFAULT_AWARDS_NAMES.PEOPLES_CHOICE
	},
	{
		name: DEFAULT_CATEGORY_NAMES.PCAs_BEST_ON_SCREEN_TALENT,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 5 * MINUTE
			}
		],
		description: 'A showreel demonstrating the on-screen skills, styles and techniques of a particular individual in any production excluding fictional content. This showreel may be made up of content from multiple productions.',
		forAwards: DEFAULT_AWARDS_NAMES.PEOPLES_CHOICE
	},
	{
		name: DEFAULT_CATEGORY_NAMES.PCAs_UN_SUNG_HERO,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.TEXT,
				maxLength: 500
			}
		],
		description: 'This award recognises the contribution of an individual to their station and/or the NaSTA community. Entries for this award must nominate a person who is a current member of your student TV station or who was a member within the last twelve months. Entries for this award may include contributions from the nominee’s whole time as a member of your station, not limited to the last twelve months. However it is intended that a major part of the contribution has taken part in the last twelve months.',
		forAwards: DEFAULT_AWARDS_NAMES.PEOPLES_CHOICE
	},
	{
		name: DEFAULT_CATEGORY_NAMES.PCAs_STATION_OF_THE_YEAR,
		supportingEvidence: [
			{
				type: SupportingEvidenceType.VIDEO,
				maxLength: 10 * MINUTE
			},
			{
				type: SupportingEvidenceType.TEXT,
				maxLength: 500
			}
		],
		description: 'A showreel demonstrating the range, quality and skills of the station and its programming, to be accompanied by a written report, with details of the operation of the station and contributions made which may not necessarily appear on screen.',
		forAwards: DEFAULT_AWARDS_NAMES.PEOPLES_CHOICE
	}
]
