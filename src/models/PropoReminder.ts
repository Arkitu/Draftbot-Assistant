import { Model, DataTypes, ModelAttributes, Sequelize } from 'sequelize';

export class PropoReminder extends Model {
    declare trigger: string;
    declare duration: number;
    declare unit: string;
    declare in_dm: boolean;
}

export const PropoReminder_init_opts: ModelAttributes = {
    trigger: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unit: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    in_dm: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}

export async function define_propo_reminder_model (sequelize: Sequelize) {
    PropoReminder.init(PropoReminder_init_opts, {sequelize})
}