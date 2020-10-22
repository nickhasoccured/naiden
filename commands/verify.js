const Discord = require('discord.js');
const { adminRole, verifiedRole } = require(`../config.json`);

module.exports = {
	name: 'verify',
	description: 'Verifies the specified member',
  guildOnly: true,
  cooldown: 5,
  args: true,
  execute(message, args) {
		// Checks that the member running the command has the adminRole (in config.json),
		// if they don't, give an error to the user, if they do, proceed.
		if (message.member.roles.cache.has(adminRole)) {
      const member = message.mentions.members.first();
      if (!member.roles.cache.has(verifiedRole)) {
				// Add role
        member.roles.add(verifiedRole);

        const embed = new Discord.MessageEmbed()
        	.setColor('#16c60c')
        	.setTitle('Success')
        	.setDescription(`Verified ${member}`);
        message.channel.send(embed);
      } else {
        const embed = new Discord.MessageEmbed()
        	.setColor('#f92921')
        	.setTitle('An error occured')
        	.setDescription(`That user already has the <@&${verifiedRole}> role`);
        message.channel.send(embed);
      }
    } else {
      const embed = new Discord.MessageEmbed()
      	.setColor('#f92921')
      	.setTitle('Insufficent Permission')
      	.setDescription(`That command requires the <@&${adminRole}> role`);
      message.channel.send(embed);
    }
	},
};
