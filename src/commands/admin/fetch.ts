import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildChannel } from 'discord.js';
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('fetch')
	.setDescription('Récupère quelque chose avec son id')
    .addStringOption(opt=>
        opt
            .setName('id')
            .setRequired(true)
            .setDescription('L\'id de l\'objet à récupérer')
    );
export async function execute(interaction: CommandInteraction) {
    let thing;
    let id = interaction.options.getString('id');
	try {
        thing = client.users.resolve(id);
    } catch {
        console.log("Not a user");
    }
    try {
        thing = client.channels.resolve(id);
    } catch {
        console.log("Not a channel");
    }
    try {
        thing = client.guilds.resolve(id);
    } catch {
        console.log("Not a guild");
    }
    try {
        thing = client.emojis.resolve(id);
    } catch {
        console.log("Not an emoji");
    }
    try {
        thing = await client.fetchWebhook(id);
    } catch {
        console.log("Not a webhook");
    }
    try {
        thing = await client.fetchInvite(id);
    } catch {
        console.log("Not an invite");
    }
    try {
        thing = await client.fetchSticker(id);
    } catch {
        console.log("Not a sticker");
    }
    console.log("This is a" + typeof thing);
    console.log("The thing :");
    console.log(thing);
    if (thing instanceof GuildChannel) {
        console.log("Permissions :");
        console.log(thing.permissionOverwrites.cache);
    }
    await interaction.reply(`${thing}`);
}