import { SlashCommandBuilder } from '@discordjs/builders';
import { Context } from '../../libs/Context.js';

export const data = new SlashCommandBuilder()
	.setName('get_ids_in_cache')
	.setDescription('Renvoie les ids des utilisateurs en cache');
export async function execute(ctx: Context) {
    await ctx.interaction.deferReply();
	
    let ids: string[] = [];

    console.debug()

    for (let guild of (await ctx.client.guilds.fetch()).keys()) {
        console.debug(guild)
        for (let id of (await ctx.client.guilds.cache.get(guild).members.fetch({ withPresences: true })).keys()) {
            ids.push(id);
        }
    }

    //let ids = ctx.client.users.cache.map(user => user.id);

    let str_ids = "\"" + ids.join('",\n"') + "\""

    console.log(str_ids);

    if (str_ids.length < 2000) {
        await ctx.interaction.editReply(str_ids);
    } else {
        await ctx.interaction.editReply("Trop de résultats pour être affichés");
    }
}