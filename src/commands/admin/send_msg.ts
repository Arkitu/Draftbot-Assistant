import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, TextBasedChannel } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('send_msg')
	.setDescription('Envoie un message avec le bot')
  .addStringOption(option =>
    option
      .setName('content')
      .setDescription('Le contenu du message')
      .setRequired(true)
  )
  .addChannelOption(option =>
    option
      .setName('channel')
      .setDescription('Le channel dans lequel envoyer le message (default: channel actuel)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option
      .setName('channel_id')
      .setDescription('Le channel dans lequel envoyer le message (default: channel actuel)')
      .setRequired(false)
  );

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply({ ephemeral: true });
  const opts = {
    content: interaction.options.getString('content', true),
    channel: (interaction.options.getChannel('channel', false) || interaction.channel) as TextBasedChannel,
    channel_id: interaction.options.getString('channel_id', false)
  };
  if (opts.channel_id) {
    opts.channel = await client.channels.fetch(opts.channel_id) as TextBasedChannel;
  }
  try {
    await opts.channel.send(opts.content);
    interaction.editReply('Message envoyé !');
  } catch (e) {
    interaction.editReply('Une erreur est survenue :\n```' + e + '\n```');
  }
}