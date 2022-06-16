import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
	.setName('fetch')
	.setDescription('Récupère quelque chose avec son id')
    .addStringOption(opt=>
        opt
            .setName('id')
            .setRequired(true)
            .setDescription('L\'id de l\'objet à récupérer')
    );
export async function execute(interaction, config, db) {
    let thing;
	try {
        thing = await interaction.client.users.fetch(interaction.options.getString('id'));
        console.log("This is an user");
    } catch {
        console.log("Not a user");
    }
    try {
        thing = await interaction.client.channels.fetch(interaction.options.getString('id'));
        console.log("This is a channel");
    } catch {
        console.log("Not a channel");
    }
    try {
        thing = await interaction.client.guilds.fetch(interaction.options.getString('id'));
        console.log("This is a guild");
    } catch {
        console.log("Not a guild");
    }
    try {
        thing = await interaction.client.emojis.fetch(interaction.options.getString('id'));
        console.log("This is an emoji");
    } catch {
        console.log("Not an emoji");
    }
    try {
        thing = await interaction.client.webhooks.fetch(interaction.options.getString('id'));
        console.log("This is a webhook");
    } catch {
        console.log("Not a webhook");
    }
    try {
        thing = await interaction.client.invites.fetch(interaction.options.getString('id'));
        console.log("This is an invite");
    } catch {
        console.log("Not an invite");
    }
    console.log("The thing :");
    console.log(thing);
    await interaction.reply(`${thing}`);
}