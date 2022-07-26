import { SlashCommandBuilder } from '@discordjs/builders';
import { Reminder } from '../../libs/Reminder.js';

export const data = new SlashCommandBuilder()
	.setName('remove_reminder')
	.setDescription('Supprime un rappel')
    .addStringOption(option => option
        .setName("message")
        .setDescription("Le message du rappel")
        .setRequired(true)
    );
export async function execute(interaction, config, db, constants) {
    await interaction.deferReply();
    let opt = {
        msg: interaction.options.getString("message")
    }
    if (db.getData(`/reminders`).filter(r => r.author_id == interaction.user.id && r.message == opt.msg).length == 0) {
        await interaction.editReply(":warning: Aucun rappel ne correspond à ce message");
        return;
    }
    for (let reminder of db.getData(`/reminders`).filter(r => r.author_id == interaction.user.id && r.message == opt.msg)) {
        let channel;
		if (reminder.channel.channel_type) {
			channel = { 
				channel: await interaction.client.channels.fetch(reminder.channel.channel_id),
				channel_type: reminder.channel.channel_type
			};
		} else {
			channel = {
				channel: await interaction.client.users.fetch(reminder.channel.channel_id),
				channel_type: reminder.channel.channel_type
			}
		}
        await new Reminder(interaction.client, channel, reminder.dead_line_timestamp, reminder.message, await interaction.client.users.fetch(reminder.author_id), db, config).delete();
    }
    await interaction.editReply("Rappel(s) supprimé(s) !");
}