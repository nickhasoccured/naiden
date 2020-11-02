const Discord = require('discord.js');
const Keyv = require('keyv');

const { adminRole } = require('../config.json');

// Configuration for Keyv (database)
const keyv = new Keyv('sqlite://database.sqlite');
keyv.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'deverify',
	description: 'Removes verification from the specified user',
  guildOnly: true,
  cooldown: 5,
  args: true,
  async execute (message, args, client) {
		if (message.member.roles.cache.has(adminRole)) {

      if ( await keyv.get(`${args[0]}_isVerified`) ) {
        const userEmail = await keyv.get(`${args[0]}_email`);
        await keyv.delete(`${args[0]}_isVerified`);
        await keyv.delete(`${args[0]}_email`);
        await keyv.delete(`${userEmail}_taken`);

        const embed = new Discord.MessageEmbed()
        	.setColor('#16c60c')
        	.setTitle('✅ Success')
        	.setDescription(`Removed verification records for <@${args[0]}>`);
        message.channel.send(embed);
      } else {
        const embed = new Discord.MessageEmbed()
        	.setColor('#f92921')
        	.setTitle('❌ An error occured')
        	.setDescription(`That user isn't verified`);
        message.channel.send(embed);
      }
    } else {
      const embed = new Discord.MessageEmbed()
      	.setColor('#f92921')
      	.setTitle('❌ Insufficent Permission')
      	.setDescription(`That command requires the <@&${adminRole}> role`);
      message.channel.send(embed);
    };

	},
};
