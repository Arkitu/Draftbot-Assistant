import { User } from '.';
import { Table, Column, Model, DataType, BelongsTo } from 'sequelize-typescript';

@Table
export default class Tracking extends Model {
    @Column({
        allowNull: false
    })
    type: "profile" | "long_report" | "short_report";

    @Column
    private data: string

    getData() {
        return JSON.parse(this.data);
    }

    setData(value: {
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
	} | {
		points: number,
		gold: number,
		xp: number,
		time: number,
		pv: number,
		id: string
	} | null) {
        if (!value) {
            this.data = null;
            return;
        }
        this.data = JSON.stringify(value)
        return this
    }

    @BelongsTo(()=>User)
    user: User;
}