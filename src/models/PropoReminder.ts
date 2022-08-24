import { Table, Column, Model, DataType, BelongsTo } from 'sequelize-typescript';
import { User } from '.';

@Table
export default class PropoReminder extends Model {
    @Column({
        allowNull: false
    })
    trigger: string;

    @Column({
        allowNull: false
    })
    durationTimestamp: number;

    @Column({
        defaultValue: false
    })
    inDm: boolean;

    @BelongsTo(()=>User)
    user: User
}