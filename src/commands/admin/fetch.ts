import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildChannel } from 'discord.js';
import { Context } from '../../libs/Context.js';

export const data = new SlashCommandBuilder()
	.setName('fetch')
	.setDescription('Récupère quelque chose avec son id')
    .addStringOption(opt=>
        opt
            .setName('id')
            .setRequired(true)
            .setDescription('L\'id de l\'objet à récupérer')
    );
export async function execute(ctx: Context) {
    let thing;
    let id = ctx.interaction.options.getString('id');
	try {
        thing = ctx.client.users.resolve(id);
    } catch {
        console.log("Not a user");
    }
    try {
        thing = ctx.client.channels.resolve(id);
    } catch {
        console.log("Not a channel");
    }
    try {
        thing = ctx.client.guilds.resolve(id);
    } catch {
        console.log("Not a guild");
    }
    try {
        thing = ctx.client.emojis.resolve(id);
    } catch {
        console.log("Not an emoji");
    }
    try {
        thing = await ctx.client.fetchWebhook(id);
    } catch {
        console.log("Not a webhook");
    }
    try {
        thing = await ctx.client.fetchInvite(id);
    } catch {
        console.log("Not an invite");
    }
    try {
        thing = await ctx.client.fetchSticker(id);
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
    await ctx.interaction.reply(`${thing}`);
}