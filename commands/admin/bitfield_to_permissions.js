import { SlashCommandBuilder } from '@discordjs/builders';
import * as bitfieldCalculator from 'discord-bitfield-calculator';

export const data = new SlashCommandBuilder()
	.setName('bitfield_to_permissions')
	.setDescription('Convertit un bitfield en permissions')
    .addStringOption(opt=>
        opt
            .setName('bitfield')
            .setRequired(true)
            .setDescription('Le bitfield à convertir')
    );
export async function execute(interaction, config, db) {
    let permissions = bitfieldCalculator.permissions(interaction.options.getString('bitfield'));
    console.log("Permissions :");
    console.log(permissions);
    await interaction.reply(`${permissions}`);
}