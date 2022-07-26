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
export async function execute(interaction, config, db, constants) {
    let thing;
    let type = "(i don't know)";
	try {
        thing = await interaction.client.users.fetch(interaction.options.getString('id'));
        type = "user";
    } catch {
        console.log("Not a user");
    }
    try {
        thing = await interaction.client.channels.fetch(interaction.options.getString('id'));
        type = "channel";
    } catch {
        console.log("Not a channel");
    }
    try {
        thing = await interaction.client.guilds.fetch(interaction.options.getString('id'));
        type = "guild";
    } catch {
        console.log("Not a guild");
    }
    try {
        thing = await interaction.client.emojis.fetch(interaction.options.getString('id'));
        type = "emoji";
    } catch {
        console.log("Not an emoji");
    }
    try {
        thing = await interaction.client.webhooks.fetch(interaction.options.getString('id'));
        type = "webhook";
    } catch {
        console.log("Not a webhook");
    }
    try {
        thing = await interaction.client.invites.fetch(interaction.options.getString('id'));
        type = "invite";
    } catch {
        console.log("Not an invite");
    }
    console.log("This is a" + type)
    console.log("The thing :");
    console.log(thing);
    if (type == "channel") {
        console.log("Permissions :");
        console.log(thing.permissionOverwrites.cache);
    }
    await interaction.reply(`${thing}`);
}