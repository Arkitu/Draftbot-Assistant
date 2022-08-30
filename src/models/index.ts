import User from './User.js';
import Reminder from './Reminder.js';
import Tracking from './Tracking.js';
import PropoReminder from './PropoReminder.js';
import Guild from './Guild.js';
import Goal from './Goal.js';

const sequelizeModels = {
    User,
    Reminder,
    Tracking,
    PropoReminder,
    Guild,
    Goal
};

export { User, Reminder, Tracking, PropoReminder, Guild, Goal, sequelizeModels };