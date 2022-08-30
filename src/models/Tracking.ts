import { User } from './index.js';
import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';

export interface ProfileData {
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

export interface LongReportData {
	points: number,
	gold: number,
	xp: number,
	time: number,
	pv: number,
	id: string
}

@Table
export default class Tracking extends Model {
    @Column({
        allowNull: false
    })
    type: "profile" | "long_report" | "short_report";

    @Column
    stringifiedData: string

	@Column(DataType.VIRTUAL)
    get data() {
		return JSON.parse(this.stringifiedData);
    }

    set data (value: ProfileData | LongReportData | null) {
        if (!value) {
            this.data = null;
            return;
        }
        this.stringifiedData = JSON.stringify(value)
    }

    @BelongsTo(()=>User)
    user: User;

	@ForeignKey(()=>User)
	userId: string;
}