import User from './User';
import Reminder from './Reminder';
import Tracking from './Tracking';
import PropoReminder from './PropoReminder';
import Guild from './Guild';
import Goal from './Goal';

const sequelizeModels = {
    User,
    Reminder,
    Tracking,
    PropoReminder,
    Guild,
    Goal
};

export { User, Reminder, Tracking, PropoReminder, Guild, Goal, sequelizeModels };