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
	tracking: {
		type: string,
		timestamp: number,
		data: object
	}[]
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