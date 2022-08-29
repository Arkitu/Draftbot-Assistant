import { User } from '.';
import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';

@Table
export default class Goal extends Model {
    @Column
    start: number;

    @Column
    end: number;

    @Column
    unit: "lvl" | "gold" | "pv" | "xp" | "gems" | "quest_missions_percentage" | "rank_points";

    @Column
    initValue: number;

    @Column
    value: number;

    @Column(DataType.VIRTUAL)
    get endValue() {
        return this.initValue + this.value;
    }

    @BelongsTo(()=>User)
    user: User;

    @ForeignKey(()=>User)
    userId: string;
}