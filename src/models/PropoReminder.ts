import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './index.js';

@Table
export default class PropoReminder extends Model {
    @Column({
        allowNull: false
    })
    trigger: string;

    @Column({
        allowNull: false
    })
    duration: number;

    @Column({
        defaultValue: false
    })
    inDm: boolean;

    @BelongsTo(()=>User)
    user: User;

    @ForeignKey(()=>User)
    userId: string;
}