import { SlashCommandBuilder } from '@discordjs/builders';
import bitfieldCalculator from 'discord-bitfield-calculator';
import { Context } from '../../libs/Context.js';

export const data = new SlashCommandBuilder()
	.setName('bitfield_to_permissions')
	.setDescription('Convertit un bitfield en permissions')
    .addStringOption(opt=>
        opt
            .setName('bitfield')
            .setRequired(true)
            .setDescription('Le bitfield à convertir')
    );
export async function execute(ctx: Context) {
    let permissions = bitfieldCalculator.permissions(ctx.interaction.options.getString('bitfield'));
    console.log("Permissions :");
    console.log(permissions);
    await ctx.interaction.reply(`${permissions}`);
}