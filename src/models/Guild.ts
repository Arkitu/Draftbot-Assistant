import { Table, Column, Model, HasMany } from 'sequelize-typescript';
import { User } from './index.js';

@Table
export default class Guild extends Model {
    @Column({
        primaryKey: true
    })
    name: string;

    @Column
    level: number;

    @Column
    description: string;

    @HasMany(()=>User)
    members: User[];
}