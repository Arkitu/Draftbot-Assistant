import { Table, Column, Model, DataType, BelongsTo, PrimaryKey, Unique, HasMany } from 'sequelize-typescript';
import { User } from '.';

@Table
export default class Guild extends Model {
    @Column
    @PrimaryKey
    @Unique
    name: string;

    @Column
    level: number;

    @Column
    description: string;

    @HasMany(()=>User)
    members: User[];
}