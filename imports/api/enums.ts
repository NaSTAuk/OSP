/**
 * All enums should be placed in this file to avoid circular dependencies,
 *  which can lead to the typescript compiler not evaluating them properly.
 */

export const enum DEFAULT_AWARDS_NAMES {
	NASTA = 'NaSTA Awards',
	PEOPLES_CHOICE = 'People\'s Choice Awards'
}

export const enum SupportingEvidenceType {
	VIDEO = 'VIDEO',
	TEXT = 'TEXT',
	PDF = 'PDF',
	CALL = 'CALL'
}

export const enum EntryType {
	VIDEO = 'entry_video',
	DOCUMENT = 'entry_document'
}

export const enum VerificationStatus {
	WAITING = 'status_waiting',
	VERIFIED = 'status_verified',
	REJECTED = 'status_rejected',
	DISPUTED = 'status_disputed'
}

export const enum DEFAULT_CATEGORY_NAMES {
	NaSTA_AWARDS_BEST_BROADCASTER = 'Best Broadcaster',
	NaSTA_AWARDS_JISC = 'Jisc award for Special Recognition',
	NaSTA_AWARDS_BEST_DRAMATIC_PERFORMANCE = 'Best Dramatic Performance',
	NaSTA_AWARDS_BEST_ON_SCREEN_TALENT = 'Best On-Screen Talent',
	NaSTA_AWARDS_STATION_MARKETING = 'Station Marketing',
	NaSTA_AWARDS_TECHNICAL_ACHIEVEMENT = 'Technical Achievement',
	NaSTA_AWARDS_FRESHERS_COVERAGE = 'Freshers\' Coverage',
	NaSTA_AWARDS_ANIMATION = 'Animation',
	NaSTA_AWARDS_NEWS_AND_CURRENT_AFFAIRS = 'News and Current Affairs',
	NaSTA_AWARDS_MARS_ELKINS_EL_BROGY = 'The Mars Elkins El-Brogy Award for Multimedia Content',
	NaSTA_AWARDS_WRITING = 'Writing',
	NaSTA_AWARDS_LIVE_BROADCAST = 'Live Broadcast',
	NaSTA_AWARDS_CINEMATOGRAPHY = 'Cimematography',
	NaSTA_AWARDS_LIGHT_ENTERTAINMENT = 'Light Entertainment',
	NaSTA_AWARDS_TITLE_SEQUENCE = 'Title Sequence',
	NaSTA_AWARDS_COMEDY = 'Comedy',
	NaSTA_AWARDS_DRAMA = 'Drama',
	DOCUMENTARY_AND_FACTUAL = 'Documentary & Factual',
	NaSTA_AWARDS_SPORT = 'Sport',
	NaSTA_AWARDS_POST_PRODUCTION_AWARD = 'Post Production Award',
	PCAs_OPEN = 'Open',
	PCAs_LIVE_BROADCAST = 'Live Broadcast',
	PCAs_CONTENT_INNOVATION = 'Content Innovation',
	PCAs_TECHNICAL_INNOVATION = 'Technical Innovation',
	PCAs_VISUAL_CREATIVITY_AND_QUALITY = 'Visual Creativity & Quality',
	PCAs_BEST_ON_SCREEN_TALENT = 'Best On-Screen Talent',
	PCAs_UN_SUNG_HERO = 'Un-Sung Hero',
	PCAs_STATION_OF_THE_YEAR = 'Station Of The Year'
}
