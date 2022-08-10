export interface DB_User {
	config: {
		reminders: {
			on: {
                [key: string]: {
                    duration: number,
                    unit: string,
                    in_dm: boolean
                };
            },
			auto_proposition: {
				events: boolean,
				minievents: boolean,
				guilddaily: boolean,
				daily: boolean,
				petfree: boolean,
				petfeed: boolean,
				vote: boolean,
				in_dm: boolean
			}
		},
		tracking: {
			reports: boolean,
			public: boolean,
			profile: boolean
		},
		goal: {
			start: number,
			end: number,
			value: number,
			unit: "lvl" | "gold" | "pv" | "xp" | "gems" | "quest_missions_percentage" | "rank_points",
			init_value: number,
			end_value: number,
			active: boolean
		}
	},
	tracking: DB_Tracking[]
}

export interface DB_Guild {
	name: string,
	level: number,
	description: string,
	last_update: number
}

export interface DB_Reminder {
	channel: {
		id: string,
		isUser: boolean
	},
	dead_line_timestamp: number,
	message: string,
	author_id: string,
	id: string
}

export interface DB_Tracking_Base {
	type: string,
	timestamp: number,
	data: object
}

export interface DB_Tracking_Profile extends DB_Tracking_Base {
	type: "profile",
	data: {
		lvl: number,
		pv: number,
		max_pv: number,
		xp: number,
		max_xp: number,
		gold: number,
		energy: number,
		max_energy: number,
		strenght: number,
		defense: number,
		speed: number,
		gems: number,
		quest_missions_percentage: number,
		rank: number,
		rank_points: number,
		class: {
			name: string,
			emoji: string
		},
		guild_name: string | null,
		destination: string
	}
}

export interface DB_Tracking_Long_Report extends DB_Tracking_Base {
	type: "long_report",
	data: {
		points: number,
		gold: number,
		xp: number,
		time: number,
		pv: number,
		id: string
	}
}

export interface DB_Tracking_Short_Report extends DB_Tracking_Base {
	type: "short_report"
}

export type DB_Tracking = DB_Tracking_Profile | DB_Tracking_Long_Report | DB_Tracking_Short_Report;

export type Profile_Property = "lvl" | "pv" | "max_pv" | "xp" | "max_xp" | "gold" | "energy" | "max_energy" | "strenght" | "defense" | "speed" | "gems" | "quest_missions_percentage" | "rank" | "rank_points" | "class" | "guild_name" | "destination";